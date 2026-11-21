# Impact Analysis

**Task:** GitHub Issue #1569 — Load `.env` in `apify run`  
**Status:** Done

## Affected Modules

| Module | Effect |
|---|---|
| `apify run` | Reads `.env` and passes its vars to the Actor |
| `src/lib/dotenv.ts` (new) | Reused later by #1572, #1573, #1574, #1576, #1581 |
| `docs/reference.md` | One more line in the `apify run` description (generated) |

## Backward Compatibility

| Who | What changes | Risk | Mitigation |
|---|---|---|---|
| Projects without `.env` | Nothing | None | Regression test |
| Projects that **already have** a `.env` for another tool (e.g. their own `dotenv` call in the Actor) | `apify run` now also loads it, and its values win over the shell and `actor.json` | **Medium.** A var that used to come from the shell may now come from `.env`. Usually it's the same value, because the Actor loads that file itself anyway | Mention it in the PR as a behaviour change |
| `.env` sets `APIFY_TOKEN`, `ACTOR_INPUT_KEY` etc. | `.env` overrides what the CLI set | Low. Intended by the issue, and `actor.json` can already do it | Mention it in the PR |
| Python users with a **virtualenv folder named `.env/`** | Reading it fails (it's a folder) | **Medium.** It would break `apify run` for them | Treat "`.env` is a directory" the same as "no `.env`" (EISDIR → `null`). **Plan adjustment, see below** |

### Plan adjustment from this analysis

Python venvs are sometimes created as `python -m venv .env`. Failing on that would break working projects. So `readDotEnv` returns `null` when `.env` is a **directory**, and fails only for a real read error on a file (e.g. no permission).

## Regression Areas

- `environmentVariables` + `@secret` resolution + `--allow-missing-secrets` work as before.
- CLI-set vars (storage dir, input key, token) are still set when there's no `.env`.
- `--input` / temp input key redirection still works (it relies on `ACTOR_INPUT_KEY`).
- The full `test:local` suite passes.

## Linked issues

| Issue | Link |
|---|---|
| #1568 / PR #1617 | Must merge first (so `.env` is never uploaded) |
| #1576 `env migrate` | Moves `environmentVariables` into `.env`; relies on this |
| #1577 deprecation | Adds a warning in the same part of `run.ts`. Small merge-conflict risk |
| #1573 `env pull` | Writes secrets as `KEY=`; the empty-value interaction is in requirements.md |
| #1581 schema validation | Validates the env built here; will reuse `readDotEnv` |
| #1578 docs rewrite | Should describe `.env` loading and precedence |

## Open Questions

- Empty values override shell values (see requirements.md). I'll raise it in the PR, not block on it.
