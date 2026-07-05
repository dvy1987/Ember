# Ember MCP — Cursor & Agent Integration

Ember exposes a **Model Context Protocol (MCP)** server so agents in Cursor can use your dragons, resume card, focus sessions, skill harness, and brain dump — **without running api-server**.

## Architecture

```
Cursor Agent  →  ember-mcp (stdio)  →  lib/ember-core  →  SQLite (data/ember.db)
                                              ↑
                              api-server (optional HTTP adapter for the web app)
```

`lib/ember-core` is the single source of truth for business logic. MCP talks to SQLite directly (local-first). The web app and optional HTTP clients use `api-server`, which imports the same core layer.

## Prerequisites

Build once after install:

```bash
cd /path/to/Ember
pnpm install
pnpm run build:mcp
```

No api-server required for MCP.

## Cursor configuration

Project-level config is in [`.cursor/mcp.json`](../.cursor/mcp.json):

```json
{
  "mcpServers": {
    "ember": {
      "command": "node",
      "args": ["artifacts/ember-mcp/dist/index.mjs"]
    }
  }
}
```

After opening this repo in Cursor:

1. Run `pnpm run build:mcp` if you have not built yet
2. Open **Cursor Settings → MCP** (or reload window)
3. Confirm **ember** server shows as connected

### Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `EMBER_DB_PATH` | `{repo}/data/ember.db` | SQLite database path (auto-discovered from repo root) |
| `OPENAI_API_KEY` | — | Enables AI brain dump, resume, and dragon skills |
| `OPENROUTER_API_KEY` | — | Alternative AI provider via env |

`ember_health` returns `ai_via` (`settings` | `env` | `none`), `mcp_version`, and `db_path`.

## Ritual tools

| Tool | Purpose |
|------|---------|
| `ember_health` | SQLite path + AI availability |
| `ember_list_menagerie` | All active dragons + inbox counts |
| `ember_open_project` | Resume Card bundle (ritual entry point) |
| `ember_begin_training` | Start focus session (optional `duration_minutes`: 15, 20, 25, 45) |
| `ember_finish_training` | End session + reflection + dragon growth |
| `ember_think_out_loud` | Brain dump → tasks/insights (AI) |
| `ember_dragon_ask` | Skill harness invocation |
| `ember_keeper_verdict` | Approve / edit / reject skill run |

## MCP resources

| URI | Content |
|-----|---------|
| `ember://projects` | Menagerie JSON |
| `ember://project/{id}/context` | Full project context for grounding |
| `ember://project/{id}/inbox` | Pending skill runs awaiting verdict |
| `ember://project/{id}/insights-tray` | Insight tray — memory, insights, contradictions |

## MCP prompts

| Prompt | Purpose |
|--------|---------|
| `resume_ritual` | Guided sacred loop for a `project_id` |

## Example agent prompts (in Cursor)

- "Use ember_list_menagerie and tell me which dragons need attention."
- "ember_open_project for \<id\> — what should I do in a 20-minute session?"
- "ember_think_out_loud on project \<id\>: I need to fix the nav layout and write tests."

## OpenAPI contract

Core loop + dragon skill harness endpoints are in [`lib/api-spec/openapi.yaml`](../lib/api-spec/openapi.yaml). Regenerate HTTP clients with:

```bash
pnpm --filter @workspace/api-spec run codegen
```

`lib/ember-sdk` is an optional HTTP client for remote api-server access. MCP does not use it.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| MCP not listed in Cursor | Reload window; run `pnpm run build:mcp` |
| `no_ai_config` on think_out_loud | Set `OPENAI_API_KEY` or configure key in Ember settings |
| `not_found` on open_project | Check project id via `ember_list_menagerie` |
| Wrong database | Set `EMBER_DB_PATH` in `.cursor/mcp.json` env |

## Optional: api-server for web UI

```bash
pnpm --filter @workspace/api-server run build
PORT=8080 pnpm --filter @workspace/api-server start
```
