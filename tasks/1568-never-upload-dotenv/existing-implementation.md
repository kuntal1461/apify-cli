# Existing Implementation Analysis

**Task:** GitHub Issue #1568 — Never upload `.env`, and ignore it in Git by default  
**Status:** Done (2026-11-21, on fork `master` synced with upstream at `f0fa4472`)

---

## 1. In plain words

When you run `apify push`, the CLI has to decide **which files from your folder get sent to Apify**. It makes a list, zips it and uploads it. This task changes how that list is made, so `.env` is never on it.

Separately, `apify init` and `apify create` write a `.gitignore` for you. This task adds `.env` to it.

---

## 2. How the upload file list is made today

Function: `getActorLocalFilePaths(cwd)` in [src/lib/utils.ts:523](../../src/lib/utils.ts#L523)

```
1. List EVERY file in the folder (dot files included), skipping a fixed list:
      **/.git, apify_storage, node_modules, storage, crawlee_storage
                                   ▲ ACTOR_FILES_HARDCODED_IGNORE  (utils.ts:520)
2. Remove files that .gitignore ignores                (git ls-files, or a fallback parser)
3. Remove files that .actorignore excludes
4. ADD BACK files that .actorignore force-includes with "!pattern"
5. ADD BACK everything under .actor/   ← always, no matter what any ignore file says
6. Return the list
```

**Where `.env` slips through:**

| Situation | Uploaded today? | Why |
|---|---|---|
| `.env` in the root, **not** in `.gitignore` | ✅ Yes, leaked | Step 2 doesn't remove it |
| `.env` in the root, in `.gitignore` | ❌ No | Step 2 removes it |
| `.actor/.env` | ✅ **Always**, leaked | Step 5 adds back everything in `.actor/` |
| `.actorignore` contains `!.env` | ✅ Yes | Step 4 adds it back |

### Who calls `getActorLocalFilePaths`

| Caller | What for | Effect of this change |
|---|---|---|
| [actors/push.ts:533](../../src/commands/actors/push.ts#L533) and [:716](../../src/commands/actors/push.ts#L716) | The files `apify push` uploads | **This is the fix** |
| [docker-context.ts:229](../../src/lib/docker-context.ts#L229) | The files for a local Docker build | `.env` also leaves the Docker build context. Good: it matches what the platform builds from, and secrets don't get baked into an image |

### A trap: `ACTOR_FILES_HARDCODED_IGNORE` has a second user

The issue says "add `.env` to the hard-coded push excludes". But that list is **also** used by [find-actor-dirs.ts:9](../../src/lib/find-actor-dirs.ts#L9), which reads it as **directory names to skip** while looking for Actors in a monorepo. Adding `.env` / `.env.*` there would change Actor discovery, which isn't wanted. On top of that, the glob ignore list can't say "exclude `.env.*` **except** `.env.example`".

→ A separate filter at the **end** of the function (after step 5) is safer. See the implementation plan.

---

## 3. How `.gitignore` is written today

Function: `setLocalEnv(actDir)` in [src/lib/utils.ts](../../src/lib/utils.ts), around line 218

```ts
const GITIGNORE_REQUIRED_CONTENTS = [getLocalStorageDir(), 'node_modules', '.venv'];
```

- For each entry, if `.gitignore` doesn't already have that **exact line**, the entry is appended under `# Added by Apify CLI`.
- Called by `apify init` ([init.ts:185](../../src/commands/init.ts#L185)) and `apify create` ([create.ts:338](../../src/commands/create.ts#L338)).
- Existing projects are **not** touched unless you run init again.

---

## 4. Tests that exist today

| File | Covers |
|---|---|
| `test/local/lib/utils.test.ts` | `getActorLocalFilePaths` + zip with `.gitignore` (real `git init` in a temp dir) |
| `test/local/lib/utils-actorignore.test.ts`, `utils-actorignore-no-git.test.ts` | `.actorignore` exclude and `!` force-include |
| `test/local/lib/utils-gitignore-fallback.test.ts`, `utils-nested-git.test.ts` | `.gitignore` fallback parser, nested repos |
| `test/local/lib/docker-context-files.test.ts` | Docker context file list |
| `test/local/commands/init.test.ts`, `create.test.ts` | No assertion on `.gitignore` contents today |

---

## Analysis Checklist

- [x] Identify relevant classes and methods
- [x] Analyze existing execution flow
- [x] Identify dependencies
- [x] Document current business logic
- [x] Complete this document
