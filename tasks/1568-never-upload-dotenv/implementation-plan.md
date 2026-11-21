# Implementation Plan

**Task:** GitHub Issue #1568 — Never upload `.env`, and ignore it in Git by default  
**Status:** Waiting for your approval

---

## 1. What and why, in short

Two small changes in [src/lib/utils.ts](../../src/lib/utils.ts):
1. Filter `.env` files out of the upload list as the **very last step**, so nothing (`.gitignore`, `.actorignore`, the `.actor/` rule) can bring them back. **Why:** secrets in `.env` must never leave your machine.
2. Add `.env` to the lines that init/create put in `.gitignore`. **Why:** so people don't commit secrets to Git either.

## 2. The code

### Change 1: final filter in `getActorLocalFilePaths`

```ts
// Local env files can hold secrets, so nothing brings them back. `.env.example` documents the keys and stays.
const isLocalEnvFile = (filePath: string) => {
	const name = basename(filePath);
	return (name === '.env' || name.startsWith('.env.')) && name !== '.env.example';
};

export const getActorLocalFilePaths = async (cwd?: string) => {
	// ... unchanged steps 1-5 ...
	return paths.filter((filePath) => !isLocalEnvFile(filePath));
};
```

### Change 2: `.gitignore`

```ts
const GITIGNORE_REQUIRED_CONTENTS = [getLocalStorageDir(), 'node_modules', '.venv', '.env'];
```

## 3. Files to change

| File | Change |
|---|---|
| `src/lib/utils.ts` | `isLocalEnvFile` helper + final filter; `.env` in `GITIGNORE_REQUIRED_CONTENTS` |
| `test/local/lib/utils.test.ts` | New tests for the upload list (see test-cases.md) |
| `test/local/commands/init.test.ts` | Assert `.env` is in `.gitignore` |
| `test/local/commands/create.test.ts` | Assert `.env` is in `.gitignore` (if a local, non-network test fits) |

No `docs/` regeneration is needed: no flags or descriptions change.

## 4. Implementation sequence

1. Write the failing tests first.
2. Add the filter + the `.gitignore` entry.
3. `pnpm run lint && pnpm run format && pnpm run build && pnpm run test:local`.
4. Update milestone.md, commit on `dev/1568-never-upload-dotenv`.
5. Clean PR branch from `upstream/master`, transfer only `src/` + `test/`, check that the diff excludes `CLAUDE.md` / `tasks/`.

## 5. Design decisions

| Decision | Why | Alternative not taken |
|---|---|---|
| Filter at the **end**, not in `ACTOR_FILES_HARDCODED_IGNORE` | That list is also used as directory names in `find-actor-dirs.ts`; and glob ignore can't express "except `.env.example`"; and step 5 (`.actor/`) would add `.actor/.env` back anyway | Editing the hard-coded list (what the issue literally says). I'll explain the deviation in the PR |
| Match by **file name at any depth** | Covers root, `.actor/`, and subfolders in one rule; the safest choice for secrets | Root + `.actor/` only |
| "Never" beats `.actorignore` `!.env` | The issue says "never"; a force-include of secrets is almost certainly a mistake | Let `.actorignore` win |
| Keep only `.env.example` | That's what the issue says | Also keep `.env.sample` / `.env.template`. Easy to add if a reviewer asks |
| Add only `.env` (not `.env.*`) to `.gitignore` | That's what the issue says; it keeps `.env.example` committable | Also add `.env.*` + `!.env.example` |
| No message when a `.env` is skipped | Not asked for; keeps output clean | Print an info line. Possible follow-up |

## Checklist

- [x] Existing implementation analysis complete
- [x] All files to change identified
- [x] Implementation sequence confirmed
- [ ] **Plan approved by you**
- [ ] Ready to start coding
