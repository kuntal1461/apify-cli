# Task: Label multi-tenant pool settings in `apify server status`

**GitHub Issue:** #1591 (sub-requirement S1)  
**Task ID:** github-1591  
**Task Name:** Label multi-tenant pool settings  
**Branch:** dev/1591-label-multi-tenant-pool-settings  
**Status:** Planning — awaiting approval  
**Created:** 2026-11-17

## Summary

Issue #1591 proposes two changes to `apify server status`:

- **S1 (this task):** label the `Memory` / `Idle timeout` / `Requests/run` block by whose pool it describes (option O2).
- S2 (out of scope, follow-up task): list the pool runs for the owner of a multi-tenant Actor, grouped by pool.
- S3: leave single-tenant output unchanged (a constraint on S1).

## Problem

`apify server status` prints `Memory`, `Idle timeout` and `Requests/run` with the same labels for every viewer
(`src/commands/server/status.ts:95-97`). For a multi-tenant Actor those values describe the owner's pool, which a
caller can't change and doesn't pay for. A caller reads them as their own settings. `--json` has the same four
keys with nothing to say whose pool they describe (P1, P3, P5).

## Goal

For a multi-tenant Actor, the three settings lines sit under a label that names the pool's owner:
`Pool (your account):` for the owner and `Pool (developer's account):` for anyone else. `--json` carries the same
fact. Single-tenant output stays exactly as it is.

## Acceptance Criteria

See [requirements.md](./requirements.md#acceptance-criteria).
