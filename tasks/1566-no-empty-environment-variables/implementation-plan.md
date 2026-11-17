# Implementation Plan

**Task:** GitHub Issue #1566 — Stop writing an empty `environmentVariables` to `actor.json`  
**Status:** Approved 2026-11-17 — implemented

## Proposed Solution

Three small source changes, exactly as scoped in the issue, plus test updates.

### 1. `src/lib/consts.ts` — drop the key from the template
```diff
 	buildTag: 'latest',
-	environmentVariables: {},
 };
```

### 2. `src/commands/actors/push.ts` — treat empty as absent
```diff
-		const envVars = actorConfig!.environmentVariables
-			? transformEnvToEnvVars(actorConfig!.environmentVariables as Record<string, string>, undefined, {
+		const environmentVariables = actorConfig!.environmentVariables as Record<string, string> | undefined;
+		// An empty object would send `envVars: []` and wipe the env vars set in Apify Console.
+		const envVars =
+			environmentVariables && Object.keys(environmentVariables).length > 0
+				? transformEnvToEnvVars(environmentVariables, undefined, {
 						allowMissing: this.flags.allowMissingSecrets,
 					})
 				: undefined;
```
`Object.keys([])` is also empty, so an empty array is treated the same way.

### 3. `src/commands/create.ts` — copy instead of mutating
```diff
-			await setLocalConfig(Object.assign(localConfig || EMPTY_LOCAL_CONFIG, { name: actorName }), dir);
+			await setLocalConfig({ ...(localConfig || EMPTY_LOCAL_CONFIG), name: actorName }, dir);
```

### 4. Tests
- `test/api/commands/push.test.ts`: add
  - `[api] should not wipe Actor envVars when environmentVariables is empty`: create an Actor with env var `MY_TEST`, write `environmentVariables: {}` to `actor.json`, push, assert the version's `envVars` is unchanged.
  - `[api] init followed by push keeps Actor envVars`: in a fresh temp dir, run `InitCommand` (`--yes`), then push to an Actor with an existing env var, assert unchanged. If the existing suite's setup makes this awkward, fold it into the test above by asserting the `init`-generated `actor.json` has no `environmentVariables` key before pushing.
- `test/local/commands/run.test.ts` (3 places): `const apifyJson = { ...EMPTY_LOCAL_CONFIG, environmentVariables: testEnvVars };` — stop mutating the constant and fix the type error from the removed key.
- `test/local/commands/init.test.ts`: assert the written `actor.json` has no `environmentVariables`. Leave the existing `Object.assign(EMPTY_LOCAL_CONFIG, …)` calls alone unless they break (out of scope).

## Files to Change

| File | Change |
|---|---|
| `src/lib/consts.ts` | remove `environmentVariables: {}` |
| `src/commands/actors/push.ts` | empty-object guard |
| `src/commands/create.ts` | spread copy instead of `Object.assign` |
| `test/api/commands/push.test.ts` | new API test(s) |
| `test/local/commands/run.test.ts` | build config via spread |
| `test/local/commands/init.test.ts` | assert key absent |

No docs regeneration needed (no flag/description changes).

## Implementation Sequence

1. consts.ts → create.ts → push.ts.
2. Fix `run.test.ts` type fallout; add `init.test.ts` assertion.
3. Add API test(s).
4. `pnpm run lint && pnpm run format && pnpm run build && pnpm run test:local`.
5. `pnpm run test:api -- push` (needs `TEST_USER_TOKEN`; if not available locally, rely on CI and say so).
6. Update task docs + milestone, commit on dev branch.
7. Clean PR branch from `upstream/master`, transfer only source/test changes, validate diff excludes `CLAUDE.md` and `tasks/**`.

## Deviations from Plan

- The init→push API test went in as a separate test (not folded in). `init` skips when `actor.json` exists, so the test deletes the template's `actor.json`, runs `InitCommand`, pushes, then restores the original file in `finally`.
- `init.test.ts`: added the `not.toHaveProperty('environmentVariables')` assertion to the existing "without dockerfile" test rather than a new test.

## Design Decisions

- **Guard in push, not only in the template.** Fixing the template alone would leave every existing project still wiping env vars. The guard fixes existing projects with no user action.
- **No way to "clear all env vars" via `{}` any more.** Intentional per the issue. Users can clear them in Console. Called out in the PR description.
- **No warning when `{}` is ignored.** Not in scope; silent no-op matches "treat as absent".
- **`run.ts` untouched.** `{}` there is already a no-op.

## Checklist

- [x] Existing implementation analysis complete
- [x] All files to change identified
- [x] Implementation sequence confirmed
- [x] Ready to start coding (approved 2026-11-17)
