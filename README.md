# Try Ember

**Ember** is a local-first ADHD productivity app where projects are dragons that grow through focused training sessions.

North star: open the app → your dragon remembers where you left off → one tap → train → reflect → better resume next time.

## Quick start

### Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) 9+

### Install & run

```bash
git clone https://github.com/dvy1987/Ember.git
cd Ember
pnpm install
pnpm run build:mcp

# Terminal 1 — API server
cd artifacts/api-server && pnpm dev

# Terminal 2 — Web UI
cd artifacts/ember && pnpm dev
```

Open **http://localhost:5000** (or the port Vite prints).

### Walkthrough mode (no API key)

For a 1-minute demo of the sacred loop:

```
http://localhost:5000/?demo=1
```

An empty keep auto-seeds a pitch dragon. Training runs 1 minute; nav is trimmed for a clean walkthrough.

### Full experience

1. Hatch or open a dragon from **Ember Keep**
2. Pick session length (15 / 20 / 25 / 45 min — **20 default**)
3. Tap **Train** on the Resume Card
4. Reflect when the timer ends — your dragon remembers

## AI / BYOK

Ember does **not** bundle AI. Two first-class paths:

| Path | Best for |
|------|----------|
| **Web app** | Add an API key in Settings (OpenAI, OpenRouter, Ollama, custom) |
| **Cursor / MCP** | Use your existing Cursor/Codex subscription — see [docs/mcp-setup.md](./docs/mcp-setup.md) |

Env fallbacks (optional): `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, `EMBER_DB_PATH`.

## MCP (power users)

```bash
pnpm run build:mcp
```

Add to Cursor via [`.cursor/mcp.json`](./.cursor/mcp.json). Ritual tools: `ember_open_project`, `ember_begin_training`, `ember_finish_training`, `ember_think_out_loud`.

Full guide: [docs/mcp-setup.md](./docs/mcp-setup.md)

## Architecture

```
Web UI  →  api-server  →  lib/ember-core  →  SQLite (data/ember.db)
Cursor  →  ember-mcp    →  lib/ember-core  →  same DB
```

## Tests

```bash
cd lib/ember-core && pnpm test
./scripts/smoke-ritual.sh   # requires api-server running
```

## More docs

- [Launch guide](./docs/launch.md)
- [Public launch plan](./docs/plans/public-launch-plan.md)
- [Show HN post draft](./docs/show-hn.md)
- [Product soul](./docs/product-soul.md)
