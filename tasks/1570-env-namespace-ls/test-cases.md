# Test Cases

**Task:** GitHub Issue #1570 — Add the `apify env` namespace and `apify env ls`  
**Status:** Planned

All in `test/local/commands/env-ls.test.ts` with a fake API client (mocked `getLoggedClientOrThrow` / `getCurrentUserInfo`), so no login is needed.

## Positive Scenarios

| # | Setup | Expected |
|---|---|---|
| P1 | Actor folder (`actor.json` name `foo`, version `0.1`), plain + secret vars | Lists version `0.1` of `me/foo`; plain value shown; secret shows `(hidden)`; sorted by name |
| P2 | `--actor me/foo`, no local project | Uses `me/foo`, version `0.0` |
| P3 | `--actor me/foo --version 0.2` | Version `0.2` |
| P4 | `--dir actors/foo` from a parent folder | Reads `actors/foo/.actor/actor.json` |
| P5 | `--json` | Object with `actor`, `version`, `envVars`; secret has no `value` key |
| P6 | Git-sourced version (`sourceType: GIT_REPO`) via `--actor` | Listed like any other |

## Negative Scenarios

| # | Setup | Expected |
|---|---|---|
| N1 | `--actor` for an Actor that doesn't exist | "not found" message, exit 250 |
| N2 | Version `0.9` doesn't exist | `Version 0.9 doesn't exist for Actor me/foo. Its versions: 0.0, 0.1.`, exit 250 |
| N3 | No `--actor`, no `actor.json` | "No Actor specified…", exit 250 |
| N4 | `--dir` and `--actor` together | Rejected by the flag framework |

## Boundary / Edge Cases

| # | Setup | Expected |
|---|---|---|
| B1 | Version with no env vars | "has no environment variables" message, exit 0 |
| B2 | In project A, `--actor B` (A's `actor.json` has version `0.5`) | Version `0.0`, not `0.5` |
| B3 | The API returns a `value` for a secret | Still not printed, not in JSON |

## Regression Scenarios

| # | Check |
|---|---|
| R1 | `builds`, `runs` and other tests that use `resolveActorContext` pass |
| R2 | `apify env` with no subcommand prints help |
| R3 | `pnpm run update-docs` runs; full `test:local` passes (except the known `python_support` local failure) |
