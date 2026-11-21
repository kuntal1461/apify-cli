# Implementation Plan

**Task:** GitHub Issue #1569 — Load `.env` in `apify run`  
**Status:** Waiting for your approval

---

## 1. What and why, in short

1. A tiny helper, `readDotEnv(dir)`, that reads and parses `.env` with Node's `util.parseEnv`. **Why a helper:** five upcoming issues (#1572, #1573, #1574, #1576, #1581) need the same thing.
2. In `apify run`: read `.env` **early** (right after `actor.json` is read), and add its values **last** when building the env. **Why early:** a broken `.env` must stop the run before the storage purge deletes anything. **Why last:** the issue says `.env` has the highest priority.
3. One extra line in the `apify run` help text, plus regenerated docs. **Why:** so people can find out that `.env` is read.

## 2. The code

### New: `src/lib/dotenv.ts`

```ts
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseEnv } from 'node:util';

export const DOTENV_FILE_NAME = '.env';

/**
 * Reads the `.env` file in `dir`. Returns `null` when there's no such file. A `.env` directory is often a Python
 * virtualenv, so it counts as no file.
 */
export const readDotEnv = async (dir: string): Promise<Record<string, string> | null> => {
	const path = join(dir, DOTENV_FILE_NAME);
	let content: string;
	try {
		content = await readFile(path, 'utf-8');
	} catch (err) {
		const { code } = err as NodeJS.ErrnoException;
		if (code === 'ENOENT' || code === 'EISDIR') return null;
		throw new Error(`Couldn't read ${path}: ${(err as Error).message}`);
	}
	return parseEnv(content) as Record<string, string>;
};
```

### Changed: `src/commands/run.ts`

```ts
// right after actor.json is read (~line 233), before any storage changes
const dotEnv = await readDotEnv(cwd);

// ...

// in the env building (~line 431), after environmentVariables
if (dotEnv) Object.assign(localEnvVars, dotEnv);
```

Help text (~line 115):
```
Executes Actor locally with simulated Apify environment variables.
Loads environment variables from a '.env' file in the Actor directory, when there is one.
Stores data in local 'storage' directory.
```

## 3. Files to change

| File | Change |
|---|---|
| `src/lib/dotenv.ts` | **New**: `readDotEnv` |
| `src/commands/run.ts` | Read early, apply last; one help-text line |
| `test/local/commands/run-dotenv.test.ts` | **New**: run tests without login (pattern from `run-without-crawlee.test.ts`) |
| `test/local/lib/dotenv.test.ts` | **New**: unit tests for `readDotEnv` |
| `docs/reference.md` (+ anything else `update-docs` touches) | Regenerated with `pnpm run update-docs` |

## 4. Implementation sequence

1. Write the failing tests.
2. Add `src/lib/dotenv.ts`, wire it into `run.ts`, update the help text.
3. `pnpm run update-docs`.
4. `pnpm run lint && pnpm run format && pnpm run build && pnpm run test:local`.
5. Update milestone.md, commit on `dev/1569-load-dotenv-in-run`.
6. Clean PR branch from `upstream/master`, check the diff (no `CLAUDE.md` / `tasks/`), open the PR. The PR description says it builds on #1617 (#1568) and should merge after it.

## 5. Design decisions

| Decision | Why | Alternative not taken |
|---|---|---|
| `util.parseEnv` | Built in (Node >= 22), as the issue asks; zero install size | The `dotenv` package |
| Shared helper in `src/lib/` | 5 upcoming commands need it | Inline in `run.ts` |
| Read early, apply last | A broken `.env` must not leave storage purged; `.env` has top priority | Read at the env-building step |
| Missing `.env` → `null`, silently | Most projects won't have one yet | Warn when it's missing |
| Unreadable `.env` → error, stop | Running with half your config is worse than stopping | Warn and continue |
| No "loaded N vars" message | Not asked for; keeps output clean | Info line. Easy to add if a reviewer wants it |
| Only `.env`, not `.env.local` / `.env.development` | That's what the issue says | Load several files. Possible follow-up |
| Values literal (no `@secret` lookup) | The issue says so; `.env` replaces `apify secrets` | Resolve `@` references |

## Checklist

- [x] Existing implementation analysis complete
- [x] All files to change identified
- [x] Implementation sequence confirmed
- [ ] **Plan approved by you**
- [ ] Ready to start coding
