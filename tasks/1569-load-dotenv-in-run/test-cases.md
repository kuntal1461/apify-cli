# Test Cases

**Task:** GitHub Issue #1569 — Load `.env` in `apify run`  
**Status:** Planned

Run tests use a `project_empty` Actor without dependencies, whose `src/main.js` writes `process.env` to a JSON file (the pattern from `run-without-crawlee.test.ts`). No login needed.

## Positive Scenarios

| # | Setup | Expected |
|---|---|---|
| P1 | `.env`: `FROM_DOTENV=yes` | The Actor sees `FROM_DOTENV=yes` |
| P2 | Shell `PRECEDENCE=shell`, `.env` `PRECEDENCE=dotenv` | `dotenv` |
| P3 | `actor.json` `PRECEDENCE=actor-json`, `.env` `PRECEDENCE=dotenv` | `dotenv` |
| P4 | `actor.json` only: `ONLY_ACTOR_JSON=1` + a `.env` with other keys | Both reach the Actor |

## Negative Scenarios

| # | Setup | Expected |
|---|---|---|
| N1 | Unit: `.env` can't be read (not a missing file, not a directory) | `readDotEnv` throws `Couldn't read …` |

## Boundary / Edge Cases

| # | Setup | Expected |
|---|---|---|
| B1 | `.env`: `SECRET_REF=@mySecret` | Literal `@mySecret` |
| B2 | Unit: comments, quotes, `export`, multi-line, `=` in values | Parsed correctly |
| B3 | Unit: no `.env` | `null` |
| B4 | Unit: `.env` is a directory (Python venv) | `null` |
| B5 | `.env`: `EMPTY=` | Empty string |

## Regression Scenarios

| # | Check |
|---|---|
| R1 | Run without `.env`: CLI vars (`ACTOR_INPUT_KEY`, storage dir) present, no error |
| R2 | Existing `run*.test.ts` files pass |
| R3 | Full `pnpm run test:local` passes (except the known `python_support.test.ts` local failure) |
