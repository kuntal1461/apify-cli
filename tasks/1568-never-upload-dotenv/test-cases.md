# Test Cases

**Task:** GitHub Issue #1568 — Never upload `.env`, and ignore it in Git by default  
**Status:** Planned

Each upload test runs `getActorLocalFilePaths` in a temp folder with a fresh `git init` (the same setup as `test/local/lib/utils.test.ts`) and **no** `.gitignore` entry for `.env`.

## Positive Scenarios

| # | Setup | Expected |
|---|---|---|
| P1 | `.env` in the root | Not in the list |
| P2 | `.actor/.env` | Not in the list (the issue asks for this one explicitly) |
| P3 | `.env.local`, `.env.production` in the root | Not in the list |
| P4 | `.actor/.env.local` | Not in the list |
| P5 | `src/.env` (subfolder) | Not in the list |
| P6 | `apify init` in an empty folder | `.gitignore` contains a `.env` line |

## Negative Scenarios

| # | Setup | Expected |
|---|---|---|
| N1 | `.actorignore` contains `!.env` | `.env` still not in the list |

## Boundary / Edge Cases

| # | Setup | Expected |
|---|---|---|
| B1 | `.env.example` in the root and in `.actor/` | **In** the list |
| B2 | `.envrc`, `my.env`, `env.json` | **In** the list (not `.env` files) |
| B3 | `.gitignore` already has a `.env` line, then `apify init` | No duplicate `.env` line |

## Regression Scenarios

| # | Check |
|---|---|
| R1 | Existing `utils.test.ts`, `utils-actorignore*.test.ts`, `utils-gitignore-fallback.test.ts`, `utils-nested-git.test.ts`, `docker-context-files.test.ts` all pass |
| R2 | Other `.actor/` files (`actor.json`, `INPUT_SCHEMA.json`) still included |
| R3 | `find-actor-dirs.test.ts` passes (discovery unchanged) |
| R4 | Full `pnpm run test:local` passes |
