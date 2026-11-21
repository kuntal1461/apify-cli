# Implementation Plan

**Task:** GitHub Issue #1574 — `apify env diff`  
**Status:** Waiting for your approval

---

## 1. What and why, in short

| Piece | What | Why |
|---|---|---|
| `diffEnvVars(local, platform)` | A pure function in `src/lib/env-diff.ts`: takes the two lists, returns the three name lists | The comparison rules live in one small, easily tested place. #1572 (`env push`) needs a very similar diff and can build on it; #1581 part 2 adds "required but missing" next to it |
| `apify env diff` | `src/commands/env/diff.ts` | Reads `.env`, fetches the platform list, calls `diffEnvVars`, prints, sets the exit code |
| `EnvDiffFound = 1` exit code | `CommandExitCodes` | A named code reads better than a bare `1`; same value as the issue asks |
| Register + docs | `env/_index.ts` subcommands; `Commands.envDiff` in the `actor-env` docs category | So it shows in help and docs |

## 2. The comparison

```ts
export interface EnvDiff {
	onlyInDotEnv: string[];
	onlyOnPlatform: string[];
	differentValues: string[];
}

export function diffEnvVars(
	local: Record<string, string>,
	platform: { name: string; isSecret: boolean; value?: string }[],
): EnvDiff {
	const platformByName = new Map(platform.map((v) => [v.name, v]));
	const onlyInDotEnv = [], differentValues = [];
	for (const [name, value] of Object.entries(local)) {
		const remote = platformByName.get(name);
		if (!remote) onlyInDotEnv.push(name);
		else if (!remote.isSecret && remote.value !== value) differentValues.push(name);  // secrets: name only
	}
	const onlyOnPlatform = platform.filter((v) => !(v.name in local)).map((v) => v.name);
	return { sort each list };
}
```

## 3. The command

```
apify env diff [--dir | --actor] [--version] [--json]
  1. client + resolveEnvTarget(flags)              → fail? error, exit 250
  2. dotEnv = readDotEnv(resolve(cwd, --dir ?? '.')) → null? "No .env file in <dir>.", exit 250
  3. platform list = envVars().list(), secret values dropped right away
  4. diff = diffEnvVars(dotEnv, platform)
  5. --json → print object; else print sections or "in sync"
  6. any difference → process.exitCode = 1
```

## 4. Files to change

| File | New / changed | What |
|---|---|---|
| `src/lib/env-diff.ts` | New | `diffEnvVars` |
| `src/commands/env/diff.ts` | New | `EnvDiffCommand` |
| `src/commands/env/_index.ts` | Changed | Add `EnvDiffCommand`; add an example |
| `src/lib/consts.ts` | Changed | `EnvDiffFound = 1` |
| `scripts/generate-cli-docs.ts` | Changed | `Commands.envDiff` in `actor-env` |
| `docs/reference.md` | Regenerated | (unrelated `apify api` drift left out again) |
| `test/local/lib/env-diff.test.ts` | New | Unit tests for the rules |
| `test/local/commands/env-diff.test.ts` | New | Command tests with a fake client, no login |

## 5. Implementation sequence

1. Failing tests (unit + command).
2. `env-diff.ts`, `diff.ts`, exit code, registration, docs category.
3. `update-docs`; lint, format, build, `test:local`.
4. Update milestone.md; commit on the dev branch.
5. PR branch: `upstream/master` + the #1618 and #1619 PR branches + only this task's commit. Open the PR as a **draft** saying it builds on #1618 and #1619. Once they merge, rebase onto `upstream/master` and mark it ready.

## 6. Design decisions

| Decision | Why | Alternative |
|---|---|---|
| Print **names only**, never values | A local `.env` value can be a real secret even when the platform var is plain; diffs end up in CI logs | Show plain values like `env ls` does |
| No `.env` → error, exit 250 | Comparing "nothing" with the platform would list every platform var as "only on the platform" and look like a real diff; an explicit error is clearer, and it's different from exit 1 so CI can tell "drift" from "broken setup" | Treat as empty |
| Empty local value vs plain platform value → different | Values are literal (#1569); `KEY=` is a real empty value | Ignore empty values |
| Empty local value vs secret → in sync | Secrets match by name; `env pull` (#1573) writes secrets as `KEY=` | — |
| Separate pure `diffEnvVars` | Testable without a client; reusable by #1572 and #1581 | Inline in the command |
| `EnvDiffFound` exit code name | Readable; value 1 as the issue says | Bare `1` |
| Exit 1 also with `--json` | CI often uses `--json` and still wants the failure | Exit 0 with `inSync: false` |

## Checklist

- [x] Existing implementation analysis complete
- [x] All files to change identified
- [x] Implementation sequence confirmed
- [ ] **Plan approved by you**
- [ ] Ready to start coding
