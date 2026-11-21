# Requirements

**Task:** GitHub Issue #1569 — Load `.env` in `apify run`  
**Status:** Final (from the issue)

## Business Requirements

- `.env` is the recommended, industry-standard place for local env vars, so `apify run` must use it.

## Expected Behavior

| Situation | Result |
|---|---|
| No `.env` file | Exactly the same as today |
| `.env` has `FOO=bar` | The Actor sees `FOO=bar` |
| `FOO` set in the shell **and** in `.env` | `.env` wins |
| `FOO` in `actor.json environmentVariables` **and** in `.env` | `.env` wins |
| `.env` sets a CLI var, e.g. `APIFY_TOKEN` | `.env` wins (issue's precedence order) |
| `.env` has `KEY=@mySecret` | The Actor sees the literal `@mySecret` |
| `.env` has `KEY=` | The Actor sees an empty string (literal; see open questions) |
| `.env` can't be read (e.g. it's a folder) | Clear error, the run doesn't start, nothing is purged |

## Constraints

- Use Node's built-in `util.parseEnv`. No new dependency.
- Never print values (they may be secrets).
- Contractions in user-facing text (repo rule).

## Acceptance Criteria

- Tests cover the precedence order and a run without `.env`.

## Open Questions

- **Empty values:** #1573 (`env pull`) will write secrets as `KEY=`. With `.env` on top, an empty `KEY=` overrides a `KEY` exported in the shell. I follow the issue ("values are literal"), but I'll mention this interaction in the PR so the maintainers can decide.
