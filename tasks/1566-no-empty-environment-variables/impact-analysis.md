# Impact Analysis

**Task:** GitHub Issue #1566 — Stop writing an empty `environmentVariables` to `actor.json`  
**Status:** Complete

## Affected Modules

| Module | Impact |
|---|---|
| `src/lib/consts.ts` (`EMPTY_LOCAL_CONFIG`) | Template shrinks by one key. Importers: `init.ts`, `create.ts`, tests (`init`, `run`, `calculate-memory`). |
| `apify init` | New `actor.json` files lack `environmentVariables`. |
| `apify create` | Same for templates without `actor.json`; no more shared-constant mutation. |
| `apify push` / `apify actors push` | `{}` (and `[]`) no longer sends `envVars`. Non-empty objects unchanged. |
| Apify API (`PUT /acts/:id/versions/:v`, `POST /acts/:id/versions`) | Request body omits `envVars` in the empty case → platform keeps existing env vars. No API contract change. |
| `apify run` | No change (`{}` already a no-op). |
| apify.json migration (`useActorConfig.ts`) | No change (already omits when no `env`). |

No database, no new dependencies, no install-size impact, no docs regeneration.

## Backward Compatibility

- **Behavior change:** a user who relied on `"environmentVariables": {}` to clear all env vars on push will find they're kept. This is the intended fix; the issue calls it the most common cause of accidental data loss. Mention in PR description.
- Existing `actor.json` files with `{}` keep working and stop causing wipes; no migration needed.
- Templates that ship their own `actor.json` are written as-is (only `name` overwritten), same as before.

## Regression Areas

- Push with a non-empty `environmentVariables` must still sync (existing API test `should work without actorId`).
- Push with secrets (`@secret`) and `--allow-missing-secrets` — unchanged path, only reached when non-empty.
- Push with all secrets missing + `--allow-missing-secrets`: `{ A: '@missing' }` is non-empty → `transformEnvToEnvVars` returns `[]` → still sends `envVars: []` and wipes. **Pre-existing behavior, out of scope**; noted as follow-up.
- `apify run` env injection (`test/local/commands/run.test.ts`).
- `apify init` output shape (`test/local/commands/init.test.ts` uses `toStrictEqual` against `EMPTY_LOCAL_CONFIG`; stays consistent since both sides lose the key).
- `apify create` writes correct `name`.
- `calculate-memory` tests spread `EMPTY_LOCAL_CONFIG` — unaffected.

## Open Questions

1. Should push warn when it ignores an empty `environmentVariables`? Proposed: no (out of scope).
2. Follow-up: should "all secrets missing with `--allow-missing-secrets`" also skip sending `envVars`? Not part of #1566; can raise on the issue after the PR.
