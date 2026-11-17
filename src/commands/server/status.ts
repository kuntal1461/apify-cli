import { META_ORIGINS } from '@apify/consts';

import { ApifyCommand } from '../../lib/command-framework/apify-command.js';
import { Args } from '../../lib/command-framework/args.js';
import { simpleLog } from '../../lib/outputs.js';
import {
	describeTenancy,
	getPoolOwner,
	getServerDefinition,
	isMultiTenant,
	listServerOperations,
	resolveServerActor,
	resolveServerBuild,
} from '../../lib/server-actor.js';
import { getCurrentUserInfo, getLoggedClientOrThrow, printJsonToStdout } from '../../lib/utils.js';

export class ServerStatusCommand extends ApifyCommand<typeof ServerStatusCommand> {
	static override name = 'status' as const;

	static override enableProfileFlag = true;

	static override description =
		"Shows how a Server Actor's server interface is configured and, for single-tenant Actors, the runs serving you. " +
		'Never sends a request to the Actor, so it cannot start a run.';

	static override examples = [
		{
			description: 'Show the server interface of an Actor.',
			command: 'apify server status apify/rag-web-browser',
		},
		{
			description: 'Print the status as JSON.',
			command: 'apify server status apify/web-fetch --json',
		},
	];

	static override docsUrl = 'https://docs.apify.com/cli/docs/reference#apify-server-status';

	static override args = {
		target: Args.string({
			description: 'The Actor ID or "username/name". Defaults to the Actor in the current directory.',
		}),
	};

	static override enableJsonFlag = true;

	async run() {
		const client = await getLoggedClientOrThrow();
		const actor = await resolveServerActor(client, this.args.target);
		const build = await resolveServerBuild(client, actor);
		const { webServerSchema, webServerMcpPath } = getServerDefinition(build);
		const operations = listServerOperations(webServerSchema);
		const multiTenant = isMultiTenant(actor);
		const { standby } = actor;

		const { username } = await getCurrentUserInfo();
		const poolOwner = getPoolOwner(actor, username);

		// A multi-tenant Actor runs in the developer's account, so the caller has no runs to list.
		let runs: { id: string; startedAt: Date }[] | undefined;

		if (!multiTenant) {
			const { items } = await client.actor(actor.id).runs().list({ status: 'RUNNING', desc: true });
			runs = items
				.filter((run) => run.meta?.origin === META_ORIGINS.STANDBY)
				.map(({ id, startedAt }) => ({ id, startedAt }));
		}

		if (this.flags.json) {
			printJsonToStdout({
				url: actor.standbyUrl,
				tenancy: actor.tenancy ?? null,
				pricingModel: actor.pricingModel ?? null,
				pool: poolOwner ? { account: poolOwner, ownerUsername: actor.ownerUsername } : null,
				build: { ref: actor.buildRef, id: build.id, buildNumber: build.buildNumber },
				memoryMbytes: standby.memoryMbytes ?? null,
				idleTimeoutSecs: standby.idleTimeoutSecs ?? null,
				desiredRequestsPerActorRun: standby.desiredRequestsPerActorRun ?? null,
				maxRequestsPerActorRun: standby.maxRequestsPerActorRun ?? null,
				operationCount: operations.length,
				mcpPath: webServerMcpPath ?? null,
				runs: runs ?? null,
			});
			return;
		}

		const tenancyLine = describeTenancy(actor, username);

		const endpointsLine =
			operations.length > 0
				? `${operations.length} documented (apify server endpoints ${actor.userFriendlyId})`
				: 'not documented (see the Actor README)';

		// Under the pool header the labels shrink by the indent, so the values stay in the same column.
		const indent = poolOwner ? '  ' : '';
		const settingLine = (label: string, value: string) => `${indent}${label.padEnd(16 - indent.length)}${value}`;

		const lines = [
			`URL:            ${actor.standbyUrl}`,
			`Tenancy:        ${tenancyLine}`,
			`Build:          ${actor.buildRef} (${build.buildNumber})`,
			...(poolOwner ? [`Pool (${poolOwner === 'yours' ? 'your' : "developer's"} account):`] : []),
			settingLine('Memory:', `${standby.memoryMbytes ?? '-'} MB`),
			settingLine('Idle timeout:', `${standby.idleTimeoutSecs ?? '-'} s`),
			settingLine(
				'Requests/run:',
				`${standby.desiredRequestsPerActorRun ?? '-'} desired, ${standby.maxRequestsPerActorRun ?? '-'} max`,
			),
			`Endpoints:      ${endpointsLine}`,
			...(webServerMcpPath ? [`MCP path:       ${webServerMcpPath}`] : []),
		];

		if (runs) {
			lines.push(
				runs.length > 0
					? `Runs:           ${runs.length} running (${runs.map((run) => run.id).join(', ')}); the next request is served warm`
					: 'Runs:           none running; the next request starts one (cold start)',
			);
		}

		simpleLog({ message: lines.join('\n'), stdout: true });
	}
}
