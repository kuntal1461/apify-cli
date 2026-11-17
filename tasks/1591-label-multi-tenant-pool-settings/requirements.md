# Requirements

**Task:** GitHub Issue #1591 (S1) — Label multi-tenant pool settings  
**Status:** Draft — awaiting approval

## Business Requirements

- BR1. A caller of a multi-tenant Actor must not read the owner's pool settings as settings they control or pay for.
- BR2. Nothing is hidden: the caller still sees memory and idle timeout, which explain the Actor's latency (why O1
  was rejected).
- BR3. The owner of a multi-tenant Actor sees that the pool is in their own account.
- BR4. `--json` output carries the same ownership fact as the text output, and doesn't drop keys per viewer.
- BR5. Single-tenant output is unchanged (issue S3).

## Expected Behavior

**Multi-tenant, viewer is not the owner:**

```
URL:            https://apify--rag-web-browser.apify.actor
Tenancy:        multi-tenant (runs in "apify"'s account; you pay per event)
Build:          latest (0.1.23)
Pool (developer's account):
  Memory:       4096 MB
  Idle timeout: 300 s
  Requests/run: 4 desired, 8 max
Endpoints:      3 documented (apify server endpoints apify/rag-web-browser)
```

**Multi-tenant, viewer is the owner:** same, with `Pool (your account):`.

**Single-tenant:** byte-for-byte identical to today.

**`--json`:** existing keys unchanged; one new key `pool`:

| Case | `pool` |
|---|---|
| Single-tenant | `null` |
| Multi-tenant, viewer is owner | `{ "account": "yours", "ownerUsername": "<owner>" }` |
| Multi-tenant, viewer isn't owner | `{ "account": "developer", "ownerUsername": "<owner>" }` |

## Constraints

- Only `src/commands/server/status.ts`, `src/lib/server-actor.ts` and their tests change. No new dependencies.
- Viewer/owner comparison must reuse the same rule as `describeTenancy` (`viewerUsername === ownerUsername`) so the
  `Tenancy:` and `Pool` lines never disagree.
- Keep the 16-character value column; indented lines keep values aligned with the rest of the output.
- No API calls added (the data is already loaded).
- Command description and `docs/` don't change for S1 (the `Runs:` wording belongs to S2).

## Acceptance Criteria

- AC1. Multi-tenant + non-owner → `Pool (developer's account):` header with the three settings indented under it.
- AC2. Multi-tenant + owner → `Pool (your account):` header with the three settings indented under it.
- AC3. Single-tenant → output identical to current `master`, no `Pool` header.
- AC4. `--json` includes `pool` per the table above; all existing keys keep their names, values and types.
- AC5. `-` placeholders for missing settings still render inside the pool block.
- AC6. Unit tests cover the new helper for single-tenant, owner, non-owner and unknown viewer.
- AC7. `pnpm run lint && pnpm run format && pnpm run build && pnpm run test:local` pass.

## Acceptance Criteria Verification (2026-11-17)

| AC | Status | Notes |
|---|---|---|
| AC1 | ✅ | Verified live |
| AC2 | ✅ | Unit-tested (no owned multi-tenant Actor available); mixed-case usernames fixed (D6) |
| AC3 | ✅ | Verified live |
| AC4 | ✅ | Verified live, existing keys unchanged |
| AC5 | ✅ | Placeholders preserved |
| AC6 | ✅ | 5 new unit tests |
| AC7 | ✅ | lint/format/build green; remaining `test:local` failures are pre-existing |

| BR | Met? |
|---|---|
| BR1 caller can't misread pool settings as their own | ✅ |
| BR2 nothing hidden | ✅ |
| BR3 owner sees it's their pool | ✅ (incl. case fix) |
| BR4 JSON carries the same fact, no keys dropped | ✅ |
| BR5 single-tenant unchanged | ✅ |
