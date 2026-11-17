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
