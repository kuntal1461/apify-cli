# Task: Never upload `.env`, and ignore it in Git by default

**GitHub Issue:** #1568  
**Task ID:** github-1568  
**Task Name:** Never upload .env, git-ignore it by default  
**Branch:** dev/1568-never-upload-dotenv  
**Status:** Plan ready — waiting for approval  
**Created:** 2026-11-21

## Summary

Make sure a `.env` file (which will hold local secrets) never ends up in the code `apify push` uploads, and make new projects git-ignore it.

## Problem

Today `apify push` uploads every file in the Actor folder unless `.gitignore` or `.actorignore` excludes it. So:
- A `.env` that isn't git-ignored gets uploaded with your code, **secrets included**.
- A `.env` inside `.actor/` is **always** uploaded, because everything in `.actor/` is force-included.
- `apify init` / `apify create` don't add `.env` to `.gitignore`.

## Goal

- `.env` and `.env.*` (for example `.env.local`) are never in the pushed source, wherever they are and whatever the ignore files say.
- `.env.example` still gets uploaded (it documents the keys, without values).
- New projects get `.env` in `.gitignore`.

## Acceptance Criteria (from the issue)

- A `.env` that isn't git-ignored doesn't appear in the pushed source, in the Actor root or under `.actor/`. Tests cover both.
- Projects made by `apify init` and `apify create` have `.env` in `.gitignore`.

## Why this task now

It's the first step towards #1581 (env var schema validation): #1568 → #1569 (`apify run` loads `.env`) → #1581 part 1. #1569 says #1568 must land first, because once `apify run` reads `.env`, people will put secrets in it.
