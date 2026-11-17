# Implementation Plan

**Task:** GitHub Issue #1591 (S1) — Label multi-tenant pool settings  
**Status:** Awaiting approval

## Proposed Solution

Issue option **O2**: keep the three settings lines, and for a multi-tenant Actor put them under a header that names
whose pool they are. Add one pure helper in `server-actor.ts` that decides the pool owner, used by both the text and
JSON output.

## Files to Change

| File | Change |
|---|---|
| `src/lib/server-actor.ts` | Add exported `getPoolOwner(actor, viewerUsername): 'yours' \| 'developer' \| undefined` (undefined for single-tenant), next to `describeTenancy`. |
| `src/commands/server/status.ts` | Use `getPoolOwner` to (a) indent the three lines under a `Pool (…):` header for multi-tenant, (b) add `pool` to `--json`. |
| `test/local/lib/server-actor.test.ts` | `describe('getPoolOwner()')` block: single-tenant, owner, non-owner, undefined viewer. |

## Implementation Sequence

1. **Helper** — in `src/lib/server-actor.ts` after `describeTenancy`:
   ```ts
   /** Whose pool the Standby settings of a multi-tenant Actor describe; single-tenant settings are the caller's own. */
   export function getPoolOwner(
   	actor: Pick<ServerActor, 'tenancy' | 'ownerUsername'>,
   	viewerUsername: string | undefined,
   ): 'yours' | 'developer' | undefined {
   	if (!isMultiTenant(actor)) return undefined;
   	return viewerUsername === actor.ownerUsername ? 'yours' : 'developer';
   }
   ```
2. **Text output** — in `status.ts`, replace lines 95-97 with:
   ```ts
   const poolOwner = getPoolOwner(actor, username);
   // Indented under the pool header, the label shrinks by the indent so values stay in the same column.
   const indent = poolOwner ? '  ' : '';
   const settingsLines = [
   	`${indent}${'Memory:'.padEnd(16 - indent.length)}${standby.memoryMbytes ?? '-'} MB`,
   	`${indent}${'Idle timeout:'.padEnd(16 - indent.length)}${standby.idleTimeoutSecs ?? '-'} s`,
   	`${indent}${'Requests/run:'.padEnd(16 - indent.length)}${desired} desired, ${max} max`,
   ];
   const lines = [
   	// URL, Tenancy, Build unchanged
   	...(poolOwner ? [`Pool (${poolOwner === 'yours' ? 'your' : "developer's"} account):`] : []),
   	...settingsLines,
   	// Endpoints, MCP path unchanged
   ];
   ```
   Result: `  Memory:       4096 MB` — value stays at column 16; single-tenant strings are byte-identical.
3. **JSON** — add `pool: poolOwner ? { account: poolOwner, ownerUsername: actor.ownerUsername } : null` after
   `pricingModel`.
4. **Tests** — add the unit tests; run the full local check.
5. Update `milestone.md` and task docs with results.

## Design Decisions

- **D1. O2 over O1/O3** — as recommended in the issue: nothing hidden, label carries the missing fact.
- **D2. Header + indented block** rather than prefixing each line (`Pool memory:`) — reads as one group and matches
  the issue's `Pool (developer's account):` wording.
- **D3. "developer's account" not the owner's username** — follows the issue text; the username is already on the
  `Tenancy:` line, so repeating it is noise. JSON includes `ownerUsername` for scripts.
- **D4. Additive JSON** (`pool` key) instead of nesting the four settings keys — #1522 just merged and may already
  be used by scripts; additive is backward compatible. (Nesting would be cleaner — see open question Q1.)
- **D5. Helper in lib, not inline** — keeps the owner rule next to `describeTenancy` and unit-testable without
  mocking the command.

## Checklist

- [x] Existing implementation analysis complete
- [x] All files to change identified
- [x] Implementation sequence confirmed
- [x] Ready to start coding — approved by user 2026-11-17

## Implementation Result (2026-11-17)

Implemented as planned. Plan approved by user before coding.

**Deviation D6 — case-insensitive owner check.** Live testing showed `GET /v2/users/me` returns the username as
registered (mixed case) while `GET /v2/acts/:id` returns the owner in lowercase. With `===`, an owner whose username
has uppercase letters would see `Pool (developer's account):` on their own Actor (breaks AC2). The same bug existed
in `describeTenancy` from #1522. Fix: one private `isActorOwner()` helper (lowercase comparison) used by both
`describeTenancy` and `getPoolOwner`, so the two lines can't disagree.
