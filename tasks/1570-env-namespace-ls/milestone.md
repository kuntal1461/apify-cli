# Development Milestones

**Task ID:** github-1570  
**Task Name:** apify env namespace + env ls  
**GitHub Issue:** #1570  
**Current Status:** Implemented and tested — PR being opened

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

- [ ] Complete code review
- [ ] Verify acceptance criteria
- [ ] Update implementation documentation
- [ ] Record final changes
- [ ] Mark task as completed

**Status:** Not Started

## Progress Summary

| Milestone | Status |
|---|---|
| Existing Implementation Analysis | Complete |
| Requirements & Technical Design | Complete |
| Development | Complete |
| Testing | Complete |
| Review & Completion | Not Started |

## Test results (2026-11-21)

- New `test/local/commands/env-ls.test.ts`: 13 tests (fake client, no login), all pass.
- Checked by hand with the built CLI: `apify env` prints help; `--dir` with `--actor` prints a clear "cannot also be provided" error.
- `pnpm run lint`: 0 errors, 28 warnings (same as before). `format`, `build`: pass.
- `pnpm run test:local`: 1312 passed, 1 failed, 7 skipped. The failure is the known local `python_support.test.ts` issue.
- `test:api`: not run (no `TEST_USER_TOKEN`); the tests mock the client.

## Deviations from the plan

- Empty message wording: "Version 0.2 of Actor me/foo doesn't have any environment variables."
- The `--dir` + `--actor` test asserts the framework error code, because `testRunCommand` throws flag errors instead of printing them.
- `update-docs` re-indented the unrelated `apify api` flags again; that drift was reverted.

## Blockers

- None.

## Change Log

| Date | Milestone | Update |
|---|---|---|
| 2026-11-21 | Initialization | Fork master already in sync; branch and task folder created; no upstream work on #1570 found |
| 2026-11-21 | M1 / M2 | Analysis and plan done |
| 2026-11-21 | M3 / M4 | Plan approved; implemented `apify env`, `apify env ls`, `resolveEnvTarget`; docs section; tests pass |
