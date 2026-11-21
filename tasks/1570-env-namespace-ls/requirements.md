# Requirements

**Task:** GitHub Issue #1570 — Add the `apify env` namespace and `apify env ls`  
**Status:** Final (from the issue, plus the decisions in implementation-plan.md)

## Business Requirements

- Creators and agents can see an Actor version's platform env vars from the terminal.
- All future `apify env` commands pick the Actor and version the same way.

## Expected Behavior

### Targeting

| You run | Actor | Version |
|---|---|---|
| `apify env ls` in an Actor folder | `name` from `.actor/actor.json` | `version` from `actor.json`, else `0.0` |
| `apify env ls --dir actors/foo` | `name` from `actors/foo/.actor/actor.json` | from that `actor.json`, else `0.0` |
| `apify env ls --actor me/foo` | `me/foo` | `--version` if given, else `0.0` (local `actor.json` is **ignored**) |
| `apify env ls --version 0.1` | as above | `0.1` |
| `--dir` and `--actor` together | Error: can't use both | — |

### Output

```
Environment variables of version 0.0 of Actor me/foo

┌──────────┬────────┬───────────┐
│ Name     │ Type   │ Value     │
├──────────┼────────┼───────────┤
│ API_KEY  │ secret │ (hidden)  │
│ LOG_LEVEL│ plain  │ debug     │
└──────────┴────────┴───────────┘
```
- Sorted by name.
- No env vars: `Version 0.0 of Actor me/foo has no environment variables.`
- `--json`: `{ "actor": { "id", "name" }, "version": "0.0", "envVars": [{ "name", "isSecret", "value" }] }`. Secrets have **no** `value` key.

### Errors (exit code 250, `NotFound`)

- Actor not found → the existing `resolveActorContext` message.
- Version not found → `Version 0.1 doesn't exist for Actor me/foo. Its versions: 0.0, 0.2.`
- No Actor (no `--actor`, no `actor.json`) → the existing "No Actor specified…" message.

## Constraints

- **Never print or emit a secret value**: not in the table, not in `--json`, not in errors.
- Don't change the behaviour of the existing users of `resolveActorContext`.
- Contractions in descriptions (repo rule); regenerate `docs/`.

## Acceptance Criteria

- Works for CLI-pushed and Git-sourced Actors.
- Clear message when the Actor or the version doesn't exist.
