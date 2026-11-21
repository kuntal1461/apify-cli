# Impact Analysis

**Task:** GitHub Issue #1568 — Never upload `.env`, and ignore it in Git by default  
**Status:** Done

## Affected Modules

| Module | Effect |
|---|---|
| `apify push` (single Actor and monorepo) | `.env` files are no longer uploaded |
| Local Docker build context (`docker-context.ts`) | `.env` files are no longer in it. Matches the platform build |
| `apify init`, `apify create` | `.gitignore` gets a `.env` line |
| `find-actor-dirs.ts` (monorepo discovery) | **Unchanged**, on purpose (see the plan) |

## Backward Compatibility

| Who | What changes for them | Risk |
|---|---|---|
| Someone who relied on `.env` being uploaded, e.g. an Actor that reads `.env` at runtime on the platform | Their `.env` stops being uploaded | **Low but real.** That's the point of the issue; values belong in platform env vars. Mention it in the PR / release notes |
| Someone with `!.env` in `.actorignore` | Their force-include stops working for `.env` | Low. Same as above |
| Python users whose virtualenv folder is named `.env/` | Unaffected: the filter matches **file** names, and a venv's files are named `bin/python`, etc. Uploading a venv is a separate, existing issue | None from this change |
| Existing projects' `.gitignore` | Untouched (only init/create write it) | None |

## Regression Areas

- `.gitignore` / `.actorignore` exclusion and `!` force-include for all other files.
- `.actor/` files still always included (except `.env` files).
- `.env.example` still uploaded.
- The init/create `.gitignore` still gets storage, `node_modules` and `.venv`, without duplicating lines.

## Linked issues

- **#1569** (load `.env` in `apify run`) depends on this one.
- **#1576** (`apify env migrate`) and **#1573** (`apify env pull`) also add `.env` to `.gitignore`. They can reuse `setLocalEnv`'s logic.
- **#1581** (schema validation) is downstream.

## Open Questions

- None blocking. Optional follow-ups for the reviewer: keep `.env.sample` / `.env.template` too? Print a note when a `.env` is skipped?
