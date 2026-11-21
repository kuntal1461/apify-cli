# Development Milestones

**Task ID:** github-1568  
**Task Name:** Never upload .env, git-ignore it by default  
**GitHub Issue:** #1568  
**Current Status:** PR open — https://github.com/apify/apify-cli/pull/1617

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
- [x] Clean PR branch `fix/1568-never-upload-dotenv` + upstream PR #1617

**Status:** Complete (PR in review)

## Progress Summary

| Milestone | Status |
|---|---|
| Existing Implementation Analysis | Complete |
| Requirements & Technical Design | Complete |
| Development | Complete |
| Testing | Complete |
| Review & Completion | PR #1617 in review |

## Test results (2026-11-21)

- New tests: `test/local/lib/utils-dotenv.test.ts` (13 tests) and 2 new tests in `test/local/commands/init.test.ts`. The 7 tests that cover the new behaviour failed before the fix and pass after it.
- `pnpm run lint`: 0 errors, 28 warnings — the same count as before the change (all existing "unused eslint-disable" warnings).
- `pnpm run format`, `pnpm run build`: pass.
- `pnpm run test:local`: 1314 passed, 1 failed, 7 skipped. The one failure (`test/local/__fixtures__/python_support.test.ts`) also fails **without** this change, so it's an existing local Python environment issue, not a regression.
- `pnpm run test:api`: not run. The change doesn't touch any API call.

## Deviations from the plan

- No `create.test.ts` assertion: create needs a template download. `init.test.ts` covers the shared `setLocalEnv` path instead.
- Added the "no duplicate `.env` line" test (B3) to `init.test.ts`.
- Updated the `getActorLocalFilePaths` docstring, which said all dot files are included.

## Blockers

- None.

## Change Log

| Date | Milestone | Update |
|---|---|---|
| 2026-11-21 | Initialization | Fork master synced with upstream (28 commits); branch and task folder created |
| 2026-11-21 | M1 / M2 | Analysis and plan done. Deviation from the issue: final filter instead of `ACTOR_FILES_HARDCODED_IGNORE` |
| 2026-11-21 | M3 / M4 | Plan approved; implemented; tests added and passing |
| 2026-11-21 | M5 | Clean PR branch from upstream/master (diff: 3 files, no CLAUDE.md/tasks); PR #1617 opened |
