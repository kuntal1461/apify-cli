# Requirements

**Task:** GitHub Issue #1566 — Stop writing an empty `environmentVariables` to `actor.json`  
**Status:** Complete

## Business Requirements

1. Users who run `apify init` / `apify create` and then `apify push` must not lose env vars configured in Apify Console.
2. Users with existing projects that already contain `"environmentVariables": {}` must also stop losing env vars, without editing their `actor.json`.

## Expected Behavior

| Scenario | Before | After |
|---|---|---|
| `apify init` output | `environmentVariables: {}` | key absent |
| `apify create` (template without `actor.json`) output | `environmentVariables: {}` | key absent |
| `apify create` (template with `actor.json`) | template's value kept | unchanged |
| push with key absent | `envVars` not sent | unchanged |
| push with `{}` | `envVars: []` (wipes Console) | `envVars` not sent |
| push with `{ A: '1' }` | `envVars: [{A}]` | unchanged |
| `apify run` with `{}` | no extra env | unchanged |

## Constraints

- Scope limited to the three bullets in the issue. No new flags, no warnings, no changes to `run`, secrets, or migration.
- Keep diffs tight (repo CLAUDE.md).
- API test must include `[api]` in its name and live in `test/api/`.

## Acceptance Criteria

- [ ] `EMPTY_LOCAL_CONFIG` has no `environmentVariables`.
- [ ] `apify init` → `apify push` to an existing Actor leaves its env vars untouched (API test).
- [ ] Push with `"environmentVariables": {}` sends no `envVars` (API test).
- [ ] `apify create` no longer mutates `EMPTY_LOCAL_CONFIG`.
- [ ] `pnpm run lint && pnpm run format && pnpm run build && pnpm run test:local` pass.
