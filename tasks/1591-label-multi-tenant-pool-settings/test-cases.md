# Test Cases

**Task:** GitHub Issue #1591 (S1) — Label multi-tenant pool settings  
**Status:** Planned

Unit tests live in `test/local/lib/server-actor.test.ts` (`describe('getPoolOwner()')`), using the existing
`serverActor()` fixture. Command output is verified manually against real Actors (no command-level test harness for
`server status` exists).

## Positive Scenarios

| ID | Scenario | Expected |
|---|---|---|
| TC1 | `getPoolOwner` — multi-tenant, viewer ≠ owner | `'developer'` |
| TC2 | `getPoolOwner` — multi-tenant, viewer = owner | `'yours'` |
| TC3 | Manual: `apify server status apify/rag-web-browser` (not owner, multi-tenant) | `Pool (developer's account):` + 3 indented lines |
| TC4 | Manual: `status` on own multi-tenant Actor | `Pool (your account):` |
| TC5 | Manual: `--json` on multi-tenant Actor | `pool: { account, ownerUsername }` |

## Negative Scenarios

| ID | Scenario | Expected |
|---|---|---|
| TC6 | `getPoolOwner` — single-tenant | `undefined` |
| TC7 | `getPoolOwner` — `tenancy` undefined | `undefined` (treated as single-tenant, same as `isMultiTenant`) |
| TC8 | Manual: `--json` on single-tenant | `pool: null` |

## Boundary / Edge Cases

| ID | Scenario | Expected |
|---|---|---|
| TC9 | `getPoolOwner` — multi-tenant, `viewerUsername` undefined | `'developer'` |
| TC10 | Standby settings missing (`memoryMbytes` etc. undefined) on multi-tenant | `-` placeholders inside the pool block |
| TC11 | Multi-tenant with `MCP path` | `MCP path:` still after `Endpoints:`, not indented |

## Regression Scenarios

| ID | Scenario | Expected |
|---|---|---|
| TC12 | Single-tenant text output | Identical to `master` |
| TC13 | Single-tenant `Runs:` line | Unchanged |
| TC14 | Existing `describeTenancy()` tests | Pass unchanged |
| TC15 | Full suite: `pnpm run lint && pnpm run format && pnpm run build && pnpm run test:local` | Pass |

## Results (2026-11-17)

| ID | Result | Evidence |
|---|---|---|
| TC1, TC2, TC6, TC7, TC9 | ✅ Pass | `getPoolOwner()` unit tests |
| TC3 | ✅ Pass | Live: `apify/rag-web-browser`, `apify/web-fetch` → `Pool (developer's account):`, values aligned at col 16 |
| TC4 | ✅ Pass (unit only) | User owns no multi-tenant Actor; covered by unit tests incl. mixed-case owner |
| TC5 | ✅ Pass | Live JSON: `"pool": { "account": "developer", "ownerUsername": "apify" }` |
| TC8 | ✅ Pass | Live JSON `jiri.spilka/weather-mcp-server`: `"pool": null` |
| TC10 | ✅ Pass | `?? '-'` placeholders unchanged, rendered via `settingLine` |
| TC11 | ✅ Pass | `MCP path` line untouched, after `Endpoints` |
| TC12, TC13 | ✅ Pass | Live single-tenant output: no `Pool` header, original labels/columns |
| TC14 | ✅ Pass | Existing `describeTenancy()` tests unchanged and green |
| TC15 | ✅ Pass with pre-existing env failures | lint/format/build green; `server-actor.test.ts` 39/39. Full `test:local` failures (`[api]` env-var `run` tests, Python fixtures, flaky `run`/`create`) reproduce identically with changes stashed — unrelated to this task |
| New | ✅ Pass | Mixed-case owner (`Jane.Doe` vs `jane.doe`) recognized by both helpers |
