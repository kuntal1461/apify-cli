# Development Milestones

**Task ID:** github-1574  
**Task Name:** apify env diff  
**GitHub Issue:** #1574  
**Current Status:** Draft PR open — https://github.com/apify/apify-cli/pull/1620 (waits for #1618 and #1619)

## Milestone 1: Existing Implementation Analysis

- [x] Identify relevant classes and methods
- [x] Analyze existing execution flow
- [x] Identify dependencies
- [x] Document current business logic
- [x] Complete `existing-implementation.md`

**Status:** Complete

## Milestone 2: Requirements & Technical Design

- [x] Finalize business requirements
- [x] Identify impacted modules
- [x] Prepare implementation approach
- [x] Document edge cases
- [x] Complete technical documentation

**Status:** Complete (approved 2026-11-21)

## Milestone 3: Development

- [x] Implement required changes
- [x] Follow existing coding standards
- [x] Review code for quality issues

**Status:** Complete

## Milestone 4: Testing

- [x] Perform unit testing
- [x] Verify positive scenarios
- [x] Verify negative scenarios
- [x] Perform regression testing
- [x] Resolve identified defects

**Status:** Complete

## Milestone 5: Review & Completion

- [x] Complete code review (self-review)
- [x] Verify acceptance criteria
- [x] Update implementation documentation
- [x] Record final changes
- [x] Clean PR branch `feat/1574-env-diff` + draft upstream PR #1620
- [ ] After #1618 and #1619 merge: rebase onto upstream/master, mark the PR ready

**Status:** In Progress (draft PR)

## Progress Summary

| Milestone | Status |
|---|---|
| Existing Implementation Analysis | Complete |
| Requirements & Technical Design | Complete |
| Development | Complete |
| Testing | Complete |
| Review & Completion | Draft PR #1620 |

## Test results (2026-11-21)

- New: `test/local/lib/env-diff.test.ts` (7) and `test/local/commands/env-diff.test.ts` (11), fake client, no login. `env-ls.test.ts` still passes.
- Built CLI checked by hand: `apify env --help` lists `diff`; `--dir` with `--actor` is rejected.
- `pnpm run lint`: 0 errors, 28 warnings (same as before). `format` (after running oxfmt on the 2 new test files), `build`: pass.
- `pnpm run test:local`: 1337 passed, 1 failed (known local `python_support.test.ts`), 7 skipped.

## Blockers
- Upstream: builds on PRs #1618 and #1619; the PR stays a draft until they merge.

## Change Log

| Date | Milestone | Update |
|---|---|---|
| 2026-11-21 | Initialization | Branch from fork master with the #1569 and #1570 PR branches merged in; task folder created |
| 2026-11-21 | M1 / M2 | Analysis and plan done |
| 2026-11-21 | M3 / M4 | Plan approved; `diffEnvVars`, `apify env diff`, `EnvDiffFound` exit code, docs; tests pass |
| 2026-11-21 | M5 | PR branch = upstream/master + #1569 and #1570 commits + this commit (8 files, no CLAUDE.md/tasks); 38 env tests pass there; draft PR #1620 opened |
