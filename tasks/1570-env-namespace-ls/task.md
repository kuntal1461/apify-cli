# Task: Add the `apify env` namespace and `apify env ls`

**GitHub Issue:** #1570  
**Task ID:** github-1570  
**Task Name:** apify env namespace + env ls  
**Branch:** dev/1570-env-namespace-ls  
**Status:** Plan ready — waiting for approval  
**Created:** 2026-11-21

## Summary

Create the new `apify env` command group, a shared "which Actor and which version?" helper that every `apify env` command will use, and the first command: `apify env ls`, which lists an Actor version's env vars on the platform.

## Problem

No CLI command shows the env vars an Actor version has on the Apify platform. You have to open Apify Console.

## Goal

- `apify env` exists as a command group (help, docs section).
- One targeting helper picks the Actor and the version:
  - Actor: `--actor <ID or username/name>`, else `.actor/actor.json` in `--dir <path>` (default: the current folder).
  - Version: `--version`, then `version` from `actor.json`, then `0.0`, the same order `apify push` uses.
- `apify env ls` prints a table: name, type (secret or plain), and the value of plain vars. **Never a secret's value.** `--json` is supported.

## Acceptance Criteria (from the issue)

- The command works for CLI-pushed and Git-sourced Actors.
- It fails with a clear message when the Actor or the version doesn't exist.

## Unblocks

- #1571 (`env set` / `rm`), #1572 (`env push`), #1573 (`env pull`), #1574 (`env diff`), and through them #1580 and #1581 parts 2 and 3.
