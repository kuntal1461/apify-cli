# Task: Load `.env` in `apify run`

**GitHub Issue:** #1569  
**Task ID:** github-1569  
**Task Name:** Load .env in apify run  
**Branch:** dev/1569-load-dotenv-in-run  
**Status:** Plan ready — waiting for approval  
**Created:** 2026-11-21

## Summary

Make `apify run` read a `.env` file from the Actor folder and give its variables to the Actor.

## Problem

Today `apify run` only takes local values from `environmentVariables` in `.actor/actor.json`. Most tools use a `.env` file for this, and it's becoming the recommended place for local env vars (and secrets) in the Apify CLI.

## Goal

- If `.env` exists next to `.actor/`, its variables reach the Actor when you run `apify run`.
- `.env` wins over everything else: shell → CLI-set vars → `actor.json environmentVariables` → **`.env`**.
- Values are taken literally: `@secret` in `.env` is **not** looked up in `apify secrets`.
- No new dependency (Node's built-in `util.parseEnv`).

## Acceptance Criteria (from the issue)

- Tests cover the precedence order and a run without `.env`.

## Out of scope

- The deprecation warning for `environmentVariables` (#1577).

## Depends on

- #1568 (never upload `.env`). **Done, PR #1617 open.** That PR has to merge first, otherwise people would start putting secrets in a file that `apify push` still uploads.

## Unblocks

- #1576 `apify env migrate`, #1577 deprecation, and **#1581 part 1** (validate env vars in `apify run`).
