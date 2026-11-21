# Implementation Plan

**Task:** GitHub Issue #1570 — Add the `apify env` namespace and `apify env ls`  
**Status:** Waiting for your approval

---

## 1. What and why, in short

| Piece | What | Why |
|---|---|---|
| `apify env` group | `src/commands/env/_index.ts`, registered | Home for `ls` now, and `set`, `rm`, `push`, `pull`, `diff`, `migrate` later |
| Targeting helper | `src/lib/commands/resolve-env-target.ts` | Every `apify env` command answers "which Actor, which version?" the same way. Written once, tested once |
| Shared flags | Exported `envTargetFlags` (`--dir`, `--actor`, `--version`) | Same flags, same help text in every `env` command |
| `apify env ls` | `src/commands/env/ls.ts` | The first useful command; proves the helper works |
| `cwd` option on `resolveActorContext` | Optional, default `process.cwd()` | Needed for `--dir`; existing callers are unchanged |
| Docs | New "Actor environment variables" section | The issue asks for the docs category |

## 2. How the targeting helper works

```
resolveEnvTarget({ client, flags: { dir, actor, version } })
  1. cwd = resolve(process.cwd(), dir ?? '.')
  2. Actor:
       --actor given  → resolveActorContext({ providedActorNameOrId: actor })
       otherwise      → resolveActorContext({ cwd })      (uses actor.json in cwd)
       not found      → { ok: false, message, exitCode: NotFound }
  3. Version:
       --version
       else, only when the Actor came from actor.json → actor.json "version"
       else '0.0'
  4. Check the version exists: client.actor(id).version(v).get()
       missing → "Version 0.1 doesn't exist for Actor me/foo. Its versions: 0.0, 0.2."
  5. → { ok: true, actorId, actorName ("me/foo"), versionNumber }
```

**Why step 3 ignores `actor.json` when `--actor` is given:** if you're inside project A and run `apify env ls --actor B`, A's version number has nothing to do with B. Using it would silently point at the wrong version.

## 3. `apify env ls`

```ts
export class EnvLsCommand extends ApifyCommand<typeof EnvLsCommand> {
	static override name = 'ls' as const;
	static override description = "Lists the environment variables of an Actor version on the Apify platform. Secret values aren't shown.";
	static override enableJsonFlag = true;
	static override flags = { ...envTargetFlags };

	async run() {
		const client = await getLoggedClientOrThrow();
		const target = await resolveEnvTarget({ client, flags: this.flags });
		if (!target.ok) { error(...); process.exitCode = target.exitCode; return; }

		const { items } = await client.actor(target.actorId).version(target.versionNumber).envVars().list();
		const envVars = items.map(({ name, value, isSecret }) => (isSecret ? { name, isSecret: true } : { name, isSecret: false, value }))
		                     .sort(by name);

		if (json) → printJsonToStdout({ actor: {...}, version, envVars })
		else if empty → info "has no environment variables"
		else → table Name | Type | Value   (secret → gray "(hidden)")
	}
}
```

**Secret safety:** the secret's value is dropped **when the API response is mapped**, before anything else sees it. So neither the table nor the JSON can leak it, even if the API returned it.

## 4. Files to change

| File | New / changed | What |
|---|---|---|
| `src/commands/env/_index.ts` | New | `EnvIndexCommand`, group "Apify Console" (same as `builds`), prints help |
| `src/commands/env/ls.ts` | New | `EnvLsCommand` |
| `src/lib/commands/resolve-env-target.ts` | New | `resolveEnvTarget` + `envTargetFlags` |
| `src/lib/commands/resolve-actor-context.ts` | Changed | Optional `cwd` (default `process.cwd()`) |
| `src/commands/_register.ts` | Changed | Register `EnvIndexCommand` |
| `scripts/generate-cli-docs.ts` | Changed | `'actor-env'` category: `env`, `env ls` |
| `scripts/reference-template.md` | Changed | "#### Actor environment variables" section with the placeholders, after "Actor deployment" |
| `docs/reference.md` | Regenerated | `pnpm run update-docs` (unrelated drift left out, as in #1569) |
| `test/local/commands/env-ls.test.ts` | New | Fake-client tests, no login (pattern from `actors-info.test.ts`) |

## 5. Implementation sequence

1. Failing tests for `env ls` + targeting.
2. `resolve-actor-context.ts` `cwd` option.
3. `resolve-env-target.ts`, `env/_index.ts`, `env/ls.ts`, register.
4. Docs category, template section, `update-docs`.
5. Lint, format, build, `test:local`.
6. Update milestone.md, commit, clean PR branch from `upstream/master`, check the diff, open the PR.

## 6. Design decisions

| Decision | Why | Alternative |
|---|---|---|
| `--actor` as a flag (as the issue says), not a positional arg like `builds ls` | Later commands (`env set <name>`) need the positional slot for the variable name | Positional |
| `--dir` and `--actor` exclusive | Using both is ambiguous | `--actor` silently wins |
| `--actor` ignores the local `actor.json` version | Avoids pointing at the wrong version (section 2) | Strict issue order |
| Check the version exists before listing | The issue asks for a clear message; lists the real versions to help | Let the API 404 |
| Exit 250 (`NotFound`) | Existing code for "doesn't exist" | Exit 1 |
| Drop secret values at mapping time | One place to get right | Filter at print time |
| Show `(hidden)` for secrets, not empty | An empty cell looks like an empty value | Empty cell |
| JSON as an object with `actor`, `version`, `envVars` | Agents need to know which target was used | Bare array |
| Group "Apify Console" | Same as `builds`, `actors`: commands about platform state | "Local Actor Development" |

## Checklist

- [x] Existing implementation analysis complete
- [x] All files to change identified
- [x] Implementation sequence confirmed
- [ ] **Plan approved by you**
- [ ] Ready to start coding
