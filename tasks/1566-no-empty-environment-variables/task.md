# Task: Stop writing an empty `environmentVariables` to `actor.json`

**GitHub Issue:** #1566  
**Task ID:** github-1566  
**Task Name:** No empty environmentVariables in actor.json  
**Branch:** dev/1566-no-empty-environment-variables  
**Status:** PR open — https://github.com/apify/apify-cli/pull/1595  
**Created:** 2026-11-17

## Summary

`apify init` (and `apify create` for templates without an `actor.json`) writes `"environmentVariables": {}` into `.actor/actor.json`. On `apify push`, `{}` is truthy, so the CLI sends `envVars: []` and wipes every env var the user set in Apify Console.

## Problem

The default config template seeds an empty `environmentVariables` object, and `push` treats "present but empty" the same as "explicitly set to nothing". This is the most common way Console env vars get deleted.

## Goal

- New projects don't get an `environmentVariables` key.
- `push` treats `environmentVariables: {}` as absent, so existing projects stop wiping env vars.
- `create` stops mutating the shared `EMPTY_LOCAL_CONFIG` constant.

## Acceptance Criteria

- `apify init` followed by `apify push` to an existing Actor leaves the Actor's env vars untouched. An API test covers it.
- A push with `"environmentVariables": {}` sends no `envVars`.

## Related upstream work

- No maintainer PR or branch covers #1566 (checked 2026-11-17).
- #1265 (draft, secrets check / array-shaped env vars) and #1352 (`--env` flag on push) touch the same area but don't overlap with this fix.
