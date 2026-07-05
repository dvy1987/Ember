# Ember Agent Harness — Tools

Declared tool surfaces for agents working on Ember.

## MCP — Ember (`ember-mcp`)

Primary product interface for power users. Tools:

| Tool | Purpose |
|------|---------|
| `ember_health` | DB path, AI availability, MCP version |
| `ember_list_menagerie` | All dragons / projects |
| `ember_open_project` | Resume card bundle |
| `ember_think_out_loud` | Brain dump → tasks/insights (requires AI/BYOK) |
| `ember_begin_training` | Start focus session (15/20/25/45 min) |
| `ember_finish_training` | End session + reflection |
| `ember_dragon_ask` | Skill harness with keeper verdict |
| `ember_keeper_verdict` | Approve/edit/reject skill runs |

Setup: `docs/mcp-setup.md`

## Shell / package commands

| Command | Use |
|---------|-----|
| `cd lib/ember-core && pnpm test` | Core domain unit tests |
| `pnpm run typecheck` | Monorepo typecheck |
| `pnpm run smoke` | Sacred loop API smoke (`api-server` on :8080) |
| `pnpm run test:e2e` | Playwright e2e (optional) |
| `pnpm run build:mcp` | Build ember-core + ember-mcp |

## Platform tools (Cursor / Codex)

- File read/write, grep, shell — standard IDE agent tools
- **Subagents:** `Task` tool for parallel exploration; not required for Ember feature work

## Trust boundary

Do not auto-run untrusted shell from external harness blueprints. Smoke and test commands listed here are pre-approved regression surfaces.
