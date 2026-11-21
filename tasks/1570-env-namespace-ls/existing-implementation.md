# Existing Implementation Analysis

**Task:** GitHub Issue #1570 — Add the `apify env` namespace and `apify env ls`  
**Status:** Done (2026-11-21, fork `master` = upstream `b17cd868`)

---

## 1. In plain words

An Actor on Apify has **versions** (e.g. `0.0`, `0.1`). Each version has its own list of **env vars**: some plain (anyone with access can read the value), some **secret** (the value is encrypted and the API doesn't give it back).

To list them, the CLI has to answer two questions: **which Actor?** and **which version?** Then it asks the API for that version's env vars and prints them.

Nothing like this exists yet. But the CLI already has most of the building blocks.

## 2. Building blocks that already exist

| Building block | Where | What it does | How we use it |
|---|---|---|---|
| Command groups ("namespaces") | e.g. [src/commands/secrets/_index.ts](../../src/commands/secrets/_index.ts), [builds/_index.ts](../../src/commands/builds/_index.ts) | An `_index.ts` class with `subcommands = [...]` whose `run()` prints help | Copy for `env/_index.ts` |
| Registering commands | [src/commands/_register.ts](../../src/commands/_register.ts) | Lists every top-level command | Add `EnvIndexCommand` |
| Finding the Actor | [src/lib/commands/resolve-actor-context.ts](../../src/lib/commands/resolve-actor-context.ts) | Given an ID, `username/name` or `name`, finds the Actor; with nothing given, uses `name` from `actor.json` + your username | Reuse. **But** it always reads `actor.json` from `process.cwd()`, so `--dir` needs a small `cwd` option |
| Picking the version in push | [actors/push.ts:818](../../src/commands/actors/push.ts#L818) | `this.flags.version \|\| actorConfig.version \|\| '0.0'` | Same order |
| `--dir` in push | [actors/push.ts:536](../../src/commands/actors/push.ts#L536) | `resolve(process.cwd(), this.flags.dir ?? '.')` | Same meaning |
| API client for env vars | `apify-client` ^2.26 | `client.actor(id).version(v).envVars().list()` returns `{ name, value, isSecret }[]` | Use. No client upgrade needed |
| Tables | [src/lib/commands/responsive-table.ts](../../src/lib/commands/responsive-table.ts), used in [builds/ls.ts](../../src/commands/builds/ls.ts) | Pretty, width-aware tables | Use for the output |
| `--json` | `static override enableJsonFlag = true` + `printJsonToStdout` | Standard JSON output | Use |
| Exit codes | `CommandExitCodes` in `src/lib/consts.ts` | `NotFound = 250`, `InvalidInput = 5` | `NotFound` when the Actor or version doesn't exist |
| Mutually exclusive flags | `exclusive: [...]` option in `src/lib/command-framework/flags.ts` | The framework rejects the combination | `--dir` vs `--actor` |
| Docs categories | [scripts/generate-cli-docs.ts](../../scripts/generate-cli-docs.ts) + [scripts/reference-template.md](../../scripts/reference-template.md) | Each category fills a `<!-- name-commands-start/end -->` block in the template | New `actor-env` category + a new section in the template |
| Testing API commands without a login | [test/local/commands/actors-info.test.ts](../../test/local/commands/actors-info.test.ts) | Mocks `getLoggedClientOrThrow` / `getCurrentUserInfo` with a fake client | Same approach, so tests run in `test:local` |

## 3. How `resolveActorContext` works today

```
resolveActorContext({ providedActorNameOrId, client })
  ├─ id contains "/"      → client.actor("user/name").get()      → found? ok : "not found"
  ├─ id given             → try as ID, then as "<me>/<name>"     → found? ok : "not found"
  ├─ actor.json has name  → client.actor("<me>/<name>").get()    → found? ok : "not found"
  └─ nothing              → "No Actor specified…"
returns { valid: true, id, userFriendlyId } or { valid: false, reason }
```

Used by `builds ls`, `builds create`, `runs ls` and others, so any change must keep their behaviour.

## 4. CLI-pushed vs Git-sourced Actors

Both kinds have versions, and env vars live on the version in both cases. The only differences: a Git-sourced version has `sourceType: "GIT_REPO"`, and its owner often has **no local `actor.json`**, so `--actor` matters for them. The env var API is the same, so no special case is needed. A test with a Git-sourced version proves it.

## 5. Limitations today

- No command lists platform env vars.
- `resolveActorContext` can't read `actor.json` from a folder other than the current one.

## Analysis Checklist

- [x] Identify relevant classes and methods
- [x] Analyze existing execution flow
- [x] Identify dependencies
- [x] Document current business logic
- [x] Complete this document
