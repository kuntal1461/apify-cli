# Existing Implementation Analysis

**Task:** GitHub Issue #1591 (S1) — Label multi-tenant pool settings  
**Status:** Complete

## Overview

`apify server status [target] [--json]` was added in #1522 (`12531565`). It describes a Server Actor's server
interface (Standby) without sending it a request. It's a single command file backed by helpers in
`src/lib/server-actor.ts`.

## Execution Flow

`ServerStatusCommand.run()` — `src/commands/server/status.ts:46-111`

1. `getLoggedClientOrThrow()` — requires login.
2. `resolveServerActor(client, target)` — resolves the Actor, throws if it has no server interface, and returns a
   `ServerActor` with `ownerUsername`, `tenancy`, `pricingModel`, `standby` (the raw `actorStandby` object).
3. `resolveServerBuild()` → `getServerDefinition()` → `listServerOperations()` — build and endpoint count.
4. `multiTenant = isMultiTenant(actor)` — `actor.tenancy === 'MULTI_TENANT'`.
5. `getCurrentUserInfo()` → `username` of the viewer.
6. If **not** multi-tenant, lists `RUNNING` runs with `meta.origin === STANDBY` (skipped for multi-tenant — that's
   S2, not this task).
7. `--json`: prints a flat object (lines 68-80) including `memoryMbytes`, `idleTimeoutSecs`,
   `desiredRequestsPerActorRun`, `maxRequestsPerActorRun`, `tenancy`, `pricingModel`, `runs`.
8. Text: builds `lines` (91-100) with a 16-character label column, then an optional `Runs:` line, and prints them
   to stdout with `simpleLog`.

Current text output (lines 95-97 are the subject of this task):

```
URL:            https://apify--rag-web-browser.apify.actor
Tenancy:        multi-tenant (runs in "apify"'s account; you pay per event)
Build:          latest (0.1.23)
Memory:         4096 MB
Idle timeout:   300 s
Requests/run:   4 desired, 8 max
Endpoints:      3 documented (apify server endpoints apify/rag-web-browser)
```

## Key Classes / Methods

| Symbol | Location | Role |
|---|---|---|
| `ServerStatusCommand.run` | `src/commands/server/status.ts:46` | Command body, builds text and JSON |
| `isMultiTenant` | `src/lib/server-actor.ts:45` | `tenancy === 'MULTI_TENANT'` |
| `describeTenancy` | `src/lib/server-actor.ts:76` | Viewer- and pricing-aware `Tenancy:` text; already compares `viewerUsername === actor.ownerUsername` |
| `describeCallerCost` | `src/lib/server-actor.ts:91` | Private helper for `describeTenancy` |
| `ServerActor` | `src/lib/server-actor.ts:33` | Resolved Actor shape |
| `getCurrentUserInfo` | `src/lib/utils.ts` | Returns viewer `username` |

## Business Logic

- **Single-tenant:** runs live in the caller's account; the caller pays platform usage; a task can override the
  Standby settings. The three settings lines are the caller's own.
- **Multi-tenant:** runs live in the owner's account in a shared pool. The settings are the owner's pool settings.
  The caller can't change them and pays only per event / dataset item / subscription (or nothing).
- **Owner viewing their own multi-tenant Actor:** the pool is theirs (`describeTenancy` already returns
  "runs in your account").

## Limitations / Issues

- L1. The three settings lines print unconditionally with no indication of whose pool they describe (issue P1, P3).
- L2. `--json` has the same keys with no ownership indicator (P5).
- L3. Owner sees no `Runs:` line for a multi-tenant Actor (P4) — **out of scope, S2**.
- No command-level tests for `server status` exist; only `describeTenancy` and other helpers are unit-tested in
  `test/local/lib/server-actor.test.ts`.

## Analysis Checklist

- [x] Identify relevant classes and methods
- [x] Analyze existing execution flow
- [x] Identify dependencies
- [x] Document current business logic
- [x] Complete this document
