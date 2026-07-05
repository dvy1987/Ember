# Ember — Current State

**Last updated:** 2026-07-05

## Project phase

Pre-PMF local-first ADHD productivity app. **Public launch plan implemented** — sacred loop, configurable sessions, ritual insights, insight tray, MCP/BYOK path, launch docs.

## Shipped (launch plan)

- **Phase 0:** README, `docs/launch.md`, memory docs
- **Phase 1:** Session length 15/20/25/45 (default 20), settings + UI picker + MCP `duration_minutes`
- **Phase 2:** Ritual analytics API + Insights page redesign + post-session nudge
- **Phase 3:** Insight tray service, API, `InsightTray` component, MCP resource
- **Phase 4:** MCP tool copy, `ember_health` enrichment, Settings MCP section, BYOK copy
- **Phase 5:** Demo mode, `docs/show-hn.md`, fetch error states
- **Phase 6:** Core ritual tests, `scripts/smoke-ritual.sh`, Playwright spec (`tests/e2e/`)

## Product spine (sacred loop)

Open app → “where was I” in <3s → one tap → train (default 20 min) → reflection → better resume next time.

## Architecture

```
artifacts/ember  →  api-server  →  lib/ember-core  →  SQLite
ember-mcp        →  lib/ember-core  →  same DB
```

## Next recommended work

Post-launch polish from deferred table: desktop, mobile, hosted SaaS, full MCP parity, memory admin UI.

## Verification commands

```bash
cd lib/ember-core && pnpm test
pnpm run typecheck
./scripts/smoke-ritual.sh   # api-server on :8080
npx playwright test         # optional e2e
```

## Revisit triggers

- Sync agent-loom → `.agents/EMBER-SKILLS.md`
- Ember UI → `ember-design-constraints` + `docs/visual-direction.md`
