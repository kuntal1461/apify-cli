# Test Cases

**Task:** GitHub Issue #1566 — Stop writing an empty `environmentVariables` to `actor.json`  
**Status:** Local executed; API pending

## Execution Results (2026-11-17)

| Check | Result |
|---|---|
| `pnpm run lint` (type-aware) | Pass |
| `pnpm run format` | Pass |
| `pnpm run build` | Pass |
| `pnpm run test:local` | 1163 passed, 1 failed, 6 skipped. The failure is `test/local/__fixtures__/python_support.test.ts` (`.venv` not created); it fails identically with the changes stashed, so it's an environment issue unrelated to this task |
| `pnpm run test:api` (push) | **Not run**: `TEST_USER_TOKEN` not set locally. Covers P2, P3, P4, B1, R4 |

P1 covered by `init.test.ts`; R1–R3 pass. B2/B3 follow from the `Object.keys(...).length > 0` guard (no dedicated test).

## Positive Scenarios

| ID | Scenario | Expected | Type |
|---|---|---|---|
| P1 | `apify init --yes` in empty dir | `.actor/actor.json` has no `environmentVariables` | local |
| P2 | Actor has env var `MY_TEST`; `actor.json` has `environmentVariables: {}`; push | version `envVars` still `[MY_TEST]` | api |
| P3 | `init` then push to existing Actor with env var | env var untouched | api |
| P4 | `environmentVariables: { MY_ENV_VAR: 'x' }`; push | version has `MY_ENV_VAR` (existing test) | api |

## Negative Scenarios

| ID | Scenario | Expected |
|---|---|---|
| N1 | `environmentVariables: { A: '@missing' }`, no `--allow-missing-secrets` | push fails with missing-secrets error (unchanged) |

## Boundary / Edge Cases

| ID | Scenario | Expected |
|---|---|---|
| B1 | `environmentVariables` key absent | `envVars` not sent (existing test) |
| B2 | `environmentVariables: []` | treated as absent, `envVars` not sent |
| B3 | `environmentVariables: null` | falsy → `envVars` not sent (unchanged) |
| B4 | `create` with template lacking `actor.json`, run twice in one process | second run doesn't inherit first run's `name` |

## Regression Scenarios

| ID | Scenario |
|---|---|
| R1 | `test/local/commands/run.test.ts` env-var injection tests pass |
| R2 | `test/local/commands/init.test.ts` passes |
| R3 | `test/local/commands/create.test.ts` passes |
| R4 | `test/api/commands/push.test.ts` existing tests pass |
| R5 | `pnpm run lint`, `format`, `build` clean |
