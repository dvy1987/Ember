# Ember Harness — Environment Bootstrap

Compact snapshot for meta-agents. See `docs/harness/manifest.json` for versioned components.

```
Stack: Next.js, React, TypeScript, SQLite, pnpm monorepo
Core: lib/ember-core (domain SSOT)
API: artifacts/api-server (:8080)
UI: artifacts/ember
MCP: artifacts/ember-mcp
Commands:
  test=cd lib/ember-core && pnpm test
  typecheck=pnpm run typecheck
  smoke=pnpm run smoke  # api-server required
  e2e=pnpm run test:e2e
Git: branch=main
Skills: .agents/skills/ (~111) + agent-loom routing
Memory: docs/memory/ (memory-startup on cold session)
Harness: docs/harness/manifest.json v0
```
