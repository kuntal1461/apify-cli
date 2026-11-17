# Impact Analysis

**Task:** GitHub Issue #1591 (S1) — Label multi-tenant pool settings  
**Status:** Complete

## Affected Modules

- `src/commands/server/status.ts` — text and JSON output only.
- `src/lib/server-actor.ts` — one new exported function; no existing function changes.
- `test/local/lib/server-actor.test.ts` — new tests.
- No API calls, no new dependencies, no `docs/` regeneration (flags/args/description unchanged).

## Backward Compatibility

- **Text output:** changes only for multi-tenant Actors. Text output isn't a stable interface; low risk.
- **JSON output:** additive (`pool` key). Existing keys keep names, values and types. Scripts that check exact key
  sets would notice; unlikely for a command merged days ago (#1522, after v1.12.0).
- **Single-tenant:** unchanged (S3).

## Regression Areas

- Single-tenant text output — must be byte-identical.
- `Tenancy:` line and `Pool` header must agree on owner vs caller (same comparison rule).
- `Runs:` line for single-tenant still appended after `Endpoints` / `MCP path`.
- `-` placeholders for missing Standby settings.
- Other `server` subcommands (`request`, `endpoints`, `url`) don't use the changed code.

## Open Questions

- **Q1. JSON shape.** Additive `pool: { account, ownerUsername } | null` (proposed) vs. moving the four settings
  keys inside `pool`. Moving is cleaner but breaking. Proposal: additive.
- **Q2. Organization accounts.** If the viewer uses an org profile (`--profile`), `getCurrentUserInfo().username`
  is the org's username, so an Actor owned by that org shows `Pool (your account):`. This matches `describeTenancy`
  today. Proposal: accept, same as `Tenancy:`.
- **Q3. Label wording.** `developer's account` (issue text) vs. the owner's name (`"apify"'s account`). Proposal:
  follow the issue.

## Post-implementation notes (2026-11-17)

- `describeTenancy` owner check is now case-insensitive (D6). For owners with mixed-case usernames, the `Tenancy:`
  line changes from "runs in \"x\"'s account; you pay …" to "runs in your account; …" — a bug fix, not a regression.
- Security review: no new inputs, network calls, or secret handling; `ownerUsername` was already printed. No findings.
