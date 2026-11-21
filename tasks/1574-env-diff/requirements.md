# Requirements

**Task:** GitHub Issue #1574 — `apify env diff`  
**Status:** Final (from the issue, plus the decisions in implementation-plan.md)

## Business Requirements

- One command that CI and pre-commit hooks can run to catch drift between `.env` and the platform.

## Expected Behavior

### How each variable is classified

| Local `.env` | Platform | Result |
|---|---|---|
| `A=1` | — | **Only in .env** |
| — | `B` (plain or secret) | **Only on the platform** |
| `C=1` | `C=1` plain | in sync |
| `C=1` | `C=2` plain | **Different value** |
| `D=anything` (even empty) | `D` secret | in sync (secrets match by name only) |
| `E=` (empty) | `E=x` plain | **Different value** |

### Output (names only, never values)

```
Comparing .env with version 0.0 of Actor me/foo

Only in .env:
  + A
Only on the platform:
  - B
Different values:
  ~ C
```
In sync:
```
.env and version 0.0 of Actor me/foo are in sync.
```

### `--json`

```json
{
  "actor": { "id": "fooId", "name": "me/foo" },
  "version": "0.0",
  "inSync": false,
  "onlyInDotEnv": ["A"],
  "onlyOnPlatform": ["B"],
  "differentValues": ["C"]
}
```

### Exit codes

| Situation | Exit code |
|---|---|
| In sync | 0 |
| Any difference | 1 (also with `--json`) |
| Actor or version not found / no Actor | 250 (from `resolveEnvTarget`) |
| No `.env` file | 250, message `No .env file in <dir>.` |

## Constraints

- **Never print a value** (local or platform, plain or secret), only names.
- Lists sorted by name.
- Contractions in user-facing text; regenerate `docs/`.

## Acceptance Criteria

- Tests cover the three kinds of difference and the exit codes.
