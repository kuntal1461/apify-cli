# Task: Add `apify env diff` to check that `.env` and the platform are in sync

**GitHub Issue:** #1574  
**Task ID:** github-1574  
**Task Name:** apify env diff  
**Branch:** dev/1574-env-diff (internal: fork master + PR branches of #1569 and #1570 merged in)  
**Status:** Draft PR open — https://github.com/apify/apify-cli/pull/1620  
**Created:** 2026-11-21

## Summary

A check for pre-commit hooks and CI: does the Actor version on the platform have the same env vars as the local `.env`?

## Scope (from the issue)

- Compare `.env` with the Actor version. List names only in `.env`, names only on the platform, and plain variables whose values differ.
- Match secrets by name only (their values can't be read).
- Exit 0 when in sync, 1 on any difference.
- Support `--json`. Never print a secret value.

## Done when (from the issue)

- Tests cover the three kinds of difference and the exit codes.

## Builds on (not merged yet)

| PR | Gives us |
|---|---|
| #1618 (#1569) | `readDotEnv` in `src/lib/dotenv.ts` |
| #1619 (#1570) | `apify env` namespace, `envTargetFlags`, `resolveEnvTarget` |

The upstream PR is opened as a **draft** until both are merged, then rebased onto `upstream/master`.

## Unblocks

- #1581 part 2 (report required vars missing on the platform in `env diff`).
- #1578 (docs: pre-commit hook example for `apify env diff`).
