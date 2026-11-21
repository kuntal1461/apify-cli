# Impact Analysis

**Task:** GitHub Issue #1570 — Add the `apify env` namespace and `apify env ls`  
**Status:** Done

## Affected Modules

| Module | Effect | Risk |
|---|---|---|
| New `apify env`, `apify env ls` | New commands only | None for existing users |
| `resolveActorContext` | Gets an optional `cwd` parameter | **Low.** Used by `builds`, `runs` and other commands. Default stays `process.cwd()`, so their behaviour is unchanged. Covered by their existing tests |
| `_register.ts` | One more entry | Very low |
| Docs generator + template | New category and section | Low. The generator throws if a placeholder is missing, so a mistake fails loudly |
| `docs/reference.md` | New section | None |

## Backward Compatibility

- No existing command, flag or output changes.
- `apify env` is a new top-level name. Check: no existing command or alias is called `env`. (Verified: no `env` command in `_register.ts`.)

## Security

| Risk | Mitigation |
|---|---|
| A secret value leaks in the table | Dropped when the API response is mapped, before printing |
| A secret value leaks in `--json` | Same mapping; a test asserts there's no `value` key for secrets |
| A secret value leaks in an error | Errors only name the Actor and version |
| Telemetry | The command framework records the command name only; no values |

## Regression Areas

- `builds ls`, `builds create`, `runs ls` and other `resolveActorContext` users: run their tests.
- `pnpm run update-docs` still works; `docs/reference.md` has only the new section in the diff.
- Full `test:local`.

## Linked issues

| Issue | Link to #1570 |
|---|---|
| #1571 `env set` / `rm` | Uses `envTargetFlags` + `resolveEnvTarget`; needs the positional slot (hence `--actor` is a flag) |
| #1572 `env push`, #1573 `env pull`, #1574 `env diff` | Same helper; also read `.env` with `readDotEnv` from #1569 (PR #1618), read from `--dir` |
| #1576 `env migrate` | Supports `--dir` too; can reuse the `cwd` resolution |
| #1580 shared store | Adds `--store` to `ls`; it will skip the version part of the helper. The `ls` table will need a "reference" marker |
| #1581 schema validation | Parts 2 and 3 hook into push, diff and pull, which build on this |

## Open Questions

- None blocking. The design decisions in implementation-plan.md section 6 will be listed in the PR so reviewers can push back.
