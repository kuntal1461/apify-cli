# Existing Implementation Analysis

**Task:** GitHub Issue #1569 — Load `.env` in `apify run`  
**Status:** Done (2026-11-21, fork `master` = upstream `b17cd868`)

---

## 1. In plain words

When you type `apify run`, the CLI starts your Actor as a child program (`node ...` or `python ...`). Before it starts it, the CLI prepares a list of env vars to give it. This task adds one more source to that list: the `.env` file.

## 2. Where the env vars come from today

File: [src/commands/run.ts](../../src/commands/run.ts), lines ~402-434 (the full step-by-step flow of `apify run` is in [tasks/1581-…/existing-implementation.md](../1581-validate-env-vars-schema/existing-implementation.md) on the #1581 branch).

```
 lowest priority
   │  1. your shell's env (process.env)                          e.g. PATH, HOME, anything you exported
   │  2. variables the CLI sets for the run                       APIFY_LOCAL_STORAGE_DIR, ACTOR_INPUT_KEY,
   │                                                              APIFY_TOKEN, APIFY_PROXY_PASSWORD, ...
   │  3. environmentVariables from .actor/actor.json              with "@name" swapped for the value from
   │                                                              ~/.apify/secrets.json (replaceSecretsValue)
   ▼
 highest priority  → final env = { ...process.env, ...localEnvVars }
```

In code:
```ts
const localEnvVars = { APIFY_LOCAL_STORAGE_DIR: ..., ACTOR_INPUT_KEY: ..., ... };   // 2
if (token) localEnvVars.APIFY_TOKEN = token;                                          // 2
if (localConfig.environmentVariables) {
    Object.assign(localEnvVars, replaceSecretsValue(localConfig.environmentVariables, ...));   // 3
}
const env = { ...process.env, ...localEnvVars };                                      // 1 + everything
```

**Nothing reads `.env` today.** There's no `dotenv` package and no `parseEnv` call anywhere in `src/`.

## 3. Facts that shape the design

| Fact | Where | Why it matters |
|---|---|---|
| The Actor folder is `process.cwd()` | [run.ts:203](../../src/commands/run.ts#L203) | `.env` is read from `cwd`, next to `.actor/` |
| The CLI needs Node >= 22 | `package.json` `engines` | `util.parseEnv` is built in, so no new dependency. CI tests Node 22 and 24 |
| `util.parseEnv` handles comments, `"quotes"`, `'quotes'`, `export KEY=`, multi-line values in double quotes, and `=` inside values | Checked by hand on Node 24 | Real-world `.env` files work |
| `actor.json` env vars can already override CLI-set vars (e.g. `APIFY_TOKEN`) | Step 3 runs after step 2 | `.env` on top is consistent with that; the issue asks for it explicitly |
| Storage purge runs **before** the env is built | run.ts ~353 | `.env` should be **read** early (so a broken file stops the run before data is deleted), and **applied** at step 3 |
| Local run tests that need no login exist | [run-without-crawlee.test.ts](../../test/local/commands/run-without-crawlee.test.ts) | New tests can run in `test:local`. The existing `environmentVariables` tests are `[api]` tests that need a login |
| `apify run` help text says "Executes Actor locally with simulated Apify environment variables." | [run.ts:114](../../src/commands/run.ts#L114) | Add one line about `.env` and regenerate `docs/` |

## 4. Other future users of `.env` reading

#1572 (`env push`), #1573 (`env pull`), #1574 (`env diff`), #1576 (`env migrate`) and #1581 (validation) all need to read `.env`. A small shared helper avoids five copies.

## Analysis Checklist

- [x] Identify relevant classes and methods
- [x] Analyze existing execution flow
- [x] Identify dependencies
- [x] Document current business logic
- [x] Complete this document
