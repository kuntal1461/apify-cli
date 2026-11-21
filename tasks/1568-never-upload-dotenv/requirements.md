# Requirements

**Task:** GitHub Issue #1568 — Never upload `.env`, and ignore it in Git by default  
**Status:** Final (from the issue)

## Business Requirements

- `.env` becomes the place for local values, including secrets. It must never reach the platform as part of the Actor's source.

## Expected Behavior

| File | Uploaded by `apify push`? |
|---|---|
| `.env` (root) | ❌ Never |
| `.env.local`, `.env.production`, any `.env.*` | ❌ Never |
| `.actor/.env`, `.actor/.env.*` | ❌ Never |
| `.env` in a subfolder (e.g. `src/.env`) | ❌ Never (my decision; see the implementation plan) |
| `.env.example` (anywhere) | ✅ Yes, as before |
| `.env` force-included with `!.env` in `.actorignore` | ❌ Never. "Never" wins |
| `.envrc`, `env.json`, `my.env` | ✅ Yes, unchanged (not `.env` files) |

- `apify init` / `apify create` add a `.env` line to `.gitignore` when it's missing.

## Constraints

- Don't change Actor discovery in monorepos (`find-actor-dirs.ts`).
- No new dependencies.
- Keep the diff tight (repo rule).

## Acceptance Criteria

See [task.md](task.md#acceptance-criteria-from-the-issue).
