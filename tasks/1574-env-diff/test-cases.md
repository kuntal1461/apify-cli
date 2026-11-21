# Test Cases

**Task:** GitHub Issue #1574 — `apify env diff`  
**Status:** Planned

Unit tests: `test/local/lib/env-diff.test.ts`. Command tests: `test/local/commands/env-diff.test.ts` with a fake client and a temp project (no login).

## Positive Scenarios

| # | Setup | Expected |
|---|---|---|
| P1 (unit) | Same names, same plain values | All three lists empty |
| P2 (cmd) | In sync | "are in sync", exit 0 |
| P3 (cmd) | `--json` in sync | `inSync: true`, empty lists, exit 0 |

## Negative Scenarios (the three kinds of difference)

| # | Setup | Expected |
|---|---|---|
| N1 (unit + cmd) | `A` only in `.env` | `onlyInDotEnv: [A]`, exit 1 |
| N2 (unit + cmd) | `B` only on the platform (plain and secret) | `onlyOnPlatform: [B]`, exit 1 |
| N3 (unit + cmd) | Plain `C` with another value | `differentValues: [C]`, exit 1 |
| N4 (cmd) | All three at once, `--json` | All lists filled, `inSync: false`, exit 1 |
| N5 (cmd) | No `.env` | `No .env file in …`, exit 250 |
| N6 (cmd) | Version doesn't exist | Error from `resolveEnvTarget`, exit 250 |

## Boundary / Edge Cases

| # | Setup | Expected |
|---|---|---|
| B1 (unit) | Secret on the platform, any local value | In sync |
| B2 (unit) | Secret on the platform, local `KEY=` | In sync |
| B3 (unit) | Plain `x` on the platform, local `KEY=` | Different value |
| B4 (cmd) | Platform returns a secret's value; local differs | Not reported, value never printed |
| B5 (cmd) | Output never contains any value | Values from both sides absent from stdout/stderr |
| B6 (cmd) | `--dir actors/foo` | Reads `actors/foo/.env` |
| B7 (unit) | Lists sorted by name | Sorted |

## Regression Scenarios

| # | Check |
|---|---|
| R1 | `env-ls.test.ts` passes |
| R2 | `apify env` help lists `diff` |
| R3 | Full `test:local` (except the known `python_support` local failure) |
