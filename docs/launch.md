# Launch guide

One page to try Ember without author help.

## Install

```bash
pnpm install
pnpm run build:mcp
```

## Start

**API server** (port 8080):

```bash
cd artifacts/api-server && pnpm dev
```

**Web UI** (port 5000):

```bash
cd artifacts/ember && pnpm dev
```

## Try the sacred loop

### Option A — Walkthrough (fastest)

Open `http://localhost:5000/?demo=1`

- 1-minute training session
- Auto-seeded pitch dragon if keep is empty
- No API key required

### Option B — Real use

1. Open `http://localhost:5000`
2. Open a dragon or create one
3. Optional: Settings → API key **or** [MCP setup](./mcp-setup.md)
4. Pick session length (default 20 min)
5. **Train** → complete → see updated resume + insight tray

## MCP from Cursor

1. `pnpm run build:mcp`
2. Open repo in Cursor — `.cursor/mcp.json` is preconfigured
3. Cursor Settings → MCP → confirm **ember** is connected
4. Ask agent: "Open my Ember project and begin training"

Details: [mcp-setup.md](./mcp-setup.md)

## Environment variables

| Variable | Purpose |
|----------|---------|
| `EMBER_DB_PATH` | SQLite file (default `data/ember.db`) |
| `OPENAI_API_KEY` | AI for brain dump / resume (optional) |
| `OPENROUTER_API_KEY` | Alternative AI provider |
| `VITE_EMBER_DEMO_MODE` | Force demo mode in build |

## Verify

```bash
cd lib/ember-core && pnpm test
curl -s http://localhost:8080/api/healthz
./scripts/smoke-ritual.sh
```

## Show HN

See [show-hn.md](./show-hn.md) for post draft and demo links.
