# Existing Implementation Analysis

**Task:** GitHub Issue #1574 — `apify env diff`  
**Status:** Done (2026-11-21, on fork master + the #1569 and #1570 PR branches)

---

## 1. In plain words

You keep your Actor's env vars in two places:
- **Locally** in a `.env` file (what `apify run` uses, since #1569).
- **On the platform**, on the Actor version (what real runs use).

They drift apart: you add `NEW_KEY` locally and forget to set it on the platform, or someone changes a value in Console. `apify env diff` compares the two lists and tells you what's different. It exits with 1 when something differs, so a CI job or a git hook can fail on it.

## 2. What already exists (after #1569 and #1570)

| Piece | Where | Use in `env diff` |
|---|---|---|
| `readDotEnv(dir)` | `src/lib/dotenv.ts` (PR #1618) | Read the local side. Returns `null` when there's no `.env` |
| `envTargetFlags` (`--dir`, `--actor`, `--version`) | `src/lib/commands/resolve-env-target.ts` (PR #1619) | Same flags as `env ls` |
| `resolveEnvTarget` | same file | Picks the Actor and version; fails with exit 250 when they don't exist |
| `apify env` namespace | `src/commands/env/_index.ts` (PR #1619) | Add `diff` to `subcommands` |
| `apify env ls` | `src/commands/env/ls.ts` (PR #1619) | Pattern: fetch with `client.actor(id).version(v).envVars().list()`, drop secret values right after the fetch, `--json` |
| Docs category `actor-env` | `scripts/generate-cli-docs.ts` (PR #1619) | Add `Commands.envDiff` |
| Fake-client tests | `test/local/commands/env-ls.test.ts` (PR #1619) | Same approach for `env-diff.test.ts` |
| Exit codes | `CommandExitCodes` in `src/lib/consts.ts` | `NotFound = 250` for errors. There's no code for "found differences" yet |

## 3. Which `.env`?

`.env` lives in the Actor folder, next to `.actor/`. So:
- `apify env diff` → `./.env`
- `apify env diff --dir actors/foo` → `actors/foo/.env`
- `apify env diff --actor me/foo` → `./.env` (the current folder; `--dir` and `--actor` can't be combined)

## 4. What the platform gives us

`envVars().list()` returns `{ name, value, isSecret }[]`. For secrets, the value isn't usable (the API doesn't return it, and we drop it anyway, like `env ls`). So a secret can only be compared **by name**.

## 5. Limitations today

- No command compares local and platform env vars.
- No exit code exists for "the check found differences".

## Analysis Checklist

- [x] Identify relevant classes and methods
- [x] Analyze existing execution flow
- [x] Identify dependencies
- [x] Document current business logic
- [x] Complete this document
