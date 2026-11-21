# Development Milestones

**Task ID:** github-1569  
**Task Name:** Load .env in apify run  
**GitHub Issue:** #1569  
**Current Status:** PR open — https://github.com/apify/apify-cli/pull/1618

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
- [x] Clean PR branch `feat/1569-load-dotenv-in-run` + upstream PR #1618

**Status:** Complete (PR in review)

## Progress Summary

| Milestone | Status |
|---|---|
| Existing Implementation Analysis | Complete |
| Requirements & Technical Design | Complete |
| Development | Complete |
| Testing | Complete |
| Review & Completion | PR #1618 in review |

## Test results (2026-11-21)

- New: `test/local/lib/dotenv.test.ts` (4) and `test/local/commands/run-dotenv.test.ts` (3). The 2 `.env` run tests failed before the change and pass after it.
- `pnpm run lint`: 0 errors, 28 warnings (same as before). `format`, `build`: pass.
- `pnpm run test:local`: 1306 passed, 1 failed, 7 skipped. The failure is the known local `python_support.test.ts` issue (fails on master too).
- `test:api`: not run locally (no `TEST_USER_TOKEN`). The 3 `[api]` env var tests in `run.test.ts` fail without a token on upstream master too; CI runs them.

## Blockers

- The upstream merge order: PR #1617 (#1568) should merge before this PR.

## Change Log

| Date | Milestone | Update |
|---|---|---|
| 2026-11-21 | Initialization | Branch from fork master; task folder created |
| 2026-11-21 | M1 / M2 | Analysis and plan done. Added: a `.env` directory (Python venv) is treated as no file |
| 2026-11-21 | M3 | Plan approved; `src/lib/dotenv.ts` + `run.ts` wiring + help text; 7 new tests pass; `docs/reference.md` regenerated (unrelated `apify api` indentation drift from update-docs reverted) |
| 2026-11-21 | M4 / M5 | Full test:local passed (known python failure only); clean PR branch from upstream/master (5 files, no CLAUDE.md/tasks); PR #1618 opened |
