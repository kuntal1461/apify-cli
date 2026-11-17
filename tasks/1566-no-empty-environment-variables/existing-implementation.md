# Existing Implementation Analysis

**Task:** GitHub Issue #1566 — Stop writing an empty `environmentVariables` to `actor.json`  
**Status:** Complete

## Overview

`EMPTY_LOCAL_CONFIG` in `src/lib/consts.ts` is the template for a new `.actor/actor.json`. It includes `environmentVariables: {}`. Both `init` and `create` write it to disk. `push` decides whether to send `envVars` to the API based only on truthiness of `actorConfig.environmentVariables`.

## Execution Flow

### `apify init` (`src/commands/init.ts:167-182`)
1. `localConfig = { ...EMPTY_LOCAL_CONFIG, ...actorConfig.unwrap().config }` — a copy, so no mutation.
2. `setLocalConfig(configToWrite, cwd)` writes `environmentVariables: {}` unless the existing config overrode it.

### `apify create` (`src/commands/create.ts:331-334`)
1. Reads the template's `.actor/actor.json` (may be `null`).
2. `setLocalConfig(Object.assign(localConfig || EMPTY_LOCAL_CONFIG, { name: actorName }), dir)`.
   - When the template has no `actor.json`, this **mutates the shared module constant** (sets `name`) and writes `environmentVariables: {}`.

### `apify push` (`src/commands/actors/push.ts:991-1022`)
1. `envVars = actorConfig.environmentVariables ? transformEnvToEnvVars(...) : undefined`.
2. `{}` is truthy → `transformEnvToEnvVars({})` returns `[]`.
3. `envVars: []` is sent in `version.update()` / `versions().create()`. The API replaces the version's env var list with an empty list → all Console env vars are deleted.
4. When `envVars` is `undefined`, the API leaves existing env vars untouched (covered by API test `should not rewrite current Actor envVars`).

### `apify run` (`src/commands/run.ts:426-431`)
- `{}` is truthy → `replaceSecretsValue({})` → `{}` merged into local env. Harmless, no change needed.

## Key Classes / Methods

| Symbol | Location | Role |
|---|---|---|
| `EMPTY_LOCAL_CONFIG` | `src/lib/consts.ts:19` | Default `actor.json` template |
| `InitCommand.run` | `src/commands/init.ts:167` | Writes config on init |
| `applyLocalConfig` (closure) | `src/commands/create.ts:331` | Writes config on create |
| `ActorsPushCommand.run` | `src/commands/actors/push.ts:992` | Builds `envVars` for the version |
| `transformEnvToEnvVars` | `src/lib/secrets.ts:113` | Object → API `EnvVar[]` (returns `[]` for `{}`) |
| `handleMigrationFlow` | `src/lib/hooks/useActorConfig.ts:160` | apify.json migration; already writes `undefined` when no `env` — not affected |

## Business Logic

- `environmentVariables` absent → push leaves platform env vars alone.
- `environmentVariables` present → push replaces platform env vars with the local list (including secrets resolved from `~/.apify`).
- Bug: "present but empty" falls in the second branch.

## Limitations / Issues

- Default template causes data loss on first push to an existing Actor.
- `create.ts` mutates a shared constant (latent bug; also affects anything reading `EMPTY_LOCAL_CONFIG` later in the same process).
- Tests also mutate the shared constant: `test/local/commands/run.test.ts:121,157,200` (assigns `environmentVariables`) and `test/local/commands/init.test.ts:54,87,132` (`Object.assign(EMPTY_LOCAL_CONFIG, ...)`). Vitest isolates per file, so this works today, but `run.test.ts` will fail type-checking once the key is removed from the constant's inferred type.

## Analysis Checklist

- [x] Identify relevant classes and methods
- [x] Analyze existing execution flow
- [x] Identify dependencies
- [x] Document current business logic
- [x] Complete this document
