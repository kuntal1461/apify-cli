# Impact Analysis

**Task:** GitHub Issue #1574 — `apify env diff`  
**Status:** Done

## Affected Modules

| Module | Effect | Risk |
|---|---|---|
| New `apify env diff` | New command | None for existing users |
| `src/lib/env-diff.ts` (new) | Pure helper | None |
| `CommandExitCodes` | One new member, value 1 (shared with `BuildFailed`, `RunFailed`, `MissingAuth`) | None: numbers unchanged |
| `env/_index.ts`, docs category | One more subcommand | Very low |
| `docs/reference.md` | New `apify env diff` section | None |

## Backward Compatibility

- Nothing existing changes. `apify env` itself is new (PR #1619).

## Dependency / merge risk

| Risk | Mitigation |
|---|---|
| Builds on two unmerged PRs (#1618, #1619). If reviewers change `readDotEnv` or `resolveEnvTarget`, this PR has to follow | Open as a draft; rebase after they merge; keep the use of both small |
| GitHub shows the #1618/#1619 changes in this PR until they merge | Say so at the top of the PR description |

## Security

| Risk | Mitigation |
|---|---|
| Values in CI logs | Output and JSON contain **names only** |
| Secret values in memory | Dropped right after the fetch, as in `env ls` |

## Regression Areas

- `apify env ls` and `apify env` help still work (their tests).
- `update-docs` still runs; the docs diff has only the new section.
- Full `test:local`.

## Linked issues

| Issue | Link |
|---|---|
| #1572 `env push` | Shows a diff before uploading; can reuse `diffEnvVars` (push needs more detail: added/changed/unchanged) |
| #1573 `env pull` | Writes secrets as `KEY=`; that's why empty-vs-secret counts as in sync |
| #1578 docs | Adds a pre-commit hook example for `env diff` |
| #1580 shared store | "Treat a reference like any other variable" in diff, so no change needed here |
| #1581 part 2 | Adds "required vars missing on the platform" to this command's output |

## Open Questions

- None blocking. Names-only output and "no `.env` is an error" are listed in the PR for reviewers.
