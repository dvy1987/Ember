# Agent Handoffs

Session continuity log for Ember. Newest entries at top.

---

## 2026-07-05 10:18 — Handoff

### Done

- **Clarified planning backlog** — Old phased plan (Phase 0–4) superseded by `docs/plans/public-launch-plan.md` (implemented). User can delete build todos from that draft; investor defer table is “don’t pitch yet,” not build work.
- **Agent-loom sync** @ `96f9e73` — 3 new skills (`harness-engineering`, `harness-evolution`, `harness-generation`); 11 updated (agent-builder, eval-pipeline, memory-handoff, memory-startup, project-orchestrator, project-setup, reality-check, retroactive-project-setup, setup-evaluation, skill-finder, skill-routing). `ember-design-constraints` protected.

### Decisions

- **Launch code is done** — Remaining work is human: dogfood, Show HN checklist (`docs/show-hn.md`), external validation. Post-launch deferred: desktop, SaaS, memory admin UI, full MCP parity, inbox copy polish.

### Deferred

- Commit/push agent-loom sync (uncommitted this session).
- Stale handoff block from `07:40` entry still contradicts reality — safe to archive or trim next cleanup pass.

### Next Agent Should Know

- **Product state:** `main` @ `3058e57` — public launch plan implemented; sacred loop hardened.
- **Dirty tree:** agent-loom sync files only (14 skills + config). No Ember product code changes this session.
- **Start here:** `docs/memory/current-state.md` → `docs/plans/public-launch-plan.md` for launch context.
- **Sync agent-loom:** rsync into Ember only; never edit `../agent-loom`. Checklist in `.agents/EMBER-SKILLS.md`.

### Revisit Triggers

- User says “sync agent-loom” → run `sync_agent_loom.py --dry-run` then `--apply`.
- User ready to launch → work through `docs/show-hn.md` checklist, not old phased plan items.

### Working Tree

- Uncommitted: `.agents/` sync from agent-loom @ `96f9e73`. Product code clean at `3058e57`.

---

## 2026-07-05 09:50 — Handoff

### Done

- **Public launch plan (Phases 0–6)** — configurable sessions, ritual Insights, insight tray, MCP/BYOK polish, launch docs, smoke + Playwright e2e.
- **Adversarial review fixes** — idempotent `endSession`/`finishTraining`; HTTP end unified on `finishTraining`; local-date analytics; filtered settings GET; stable insight-tray IDs; server-side ritual metrics.
- **New:** `README.md`, `docs/launch.md`, `docs/show-hn.md`, `scripts/smoke-ritual.sh`, `InsightTray`, `SessionDurationPicker`.

### Decisions

- **Single completion path:** Web and MCP both use `finishTraining()` — no split reflection HTTP call from UI.
- **Settings table:** User-facing GET filtered; internal keys (metrics, dismiss) excluded.

### Next Agent Should Know

- Verify: `cd lib/ember-core && pnpm test` (18 tests), `pnpm run typecheck`, `./scripts/smoke-ritual.sh`.
- Launch plan status: `docs/plans/public-launch-plan.md` marked implemented.
- Post-launch deferred: desktop, mobile, SaaS, full MCP parity, memory admin UI.

### Working Tree

- Committed and pushed this session.

---

## 2026-07-05 07:40 — Handoff

### Done

- **Sacred loop UX** — Resume Card copy, session complete payoff (`SessionCompletePayoff`), ritual copy polish, task auto-pick (partial match on `suggested_next_step`).
- **`lib/ember-core`** — domain logic SSOT; api-server + ember-mcp are thin adapters. `ritualMetricsService` + tests.
- **Ritual metrics** — `POST /api/ritual-metrics`, frontend `trackRitualEvent` (`hero_visible`, `train_tap`, `timer_started`, `session_completed`).
- **Demo / walkthrough mode** — `?demo=1` (1-min timer, banner, nav trimmed, `POST /api/demo/bootstrap` for empty keep). `DemoModeContext` preserves demo across navigation.
- **Bug fixes** — ProjectPage hooks violation; SessionPage state reset on `projectId` change; duplicate metric guards; demo query param preserved in `sessionNavigation.ts`.
- **Agent skills** — `ember-design-constraints` standalone + protected; `frontend-design` un-forked. Synced agent-loom @ `2a796a7` (`svg-creation` + prior `613bba2` batch).
- **Launch plan** — `docs/plans/public-launch-plan.md` (Phases 0–6, locked Q&A decisions, deferred table, success metrics).

### Debated

- **Feature breadth vs ritual depth** — Chose quality on sacred loop + insight tray + MCP/BYOK over platform expansion (orchestrator routing, full KG UI, MCP parity). Deferred items documented in launch plan.

### Decisions

- **AI:** BYOK; intelligence via **MCP** in Cursor/Codex/CLI — not bundled server AI.
- **Cognition UI:** **Insight tray** on Project page (not built yet); not full knowledge-graph primary UI.
- **Distribution:** Local web now; desktop / hosted SaaS / **mobile later**.
- **Session length:** User picks 15 / 20 / 25 / 45; **20 min default** everywhere (Phase 1 not started — demo still hardcodes 1 min).
- **Ritual metrics:** **Users** see them in Insights (Phase 2); raw events logging exists now.
- **Launch north star:** Stranger installs → understands “my dragon remembers” → trains in <30s → completes session → sees updated memory + ritual stats; power users same jobs via MCP.
- **Minimum viable launch if timeboxed:** Phase 0 + 1 + 4 + 5.1 + 6.2; prefer slipping Playwright over cutting Phase 3 (insight tray).

### Deferred

- See `docs/plans/public-launch-plan.md` § Deferred — LLM orchestrator routing, full KG UI, MCP API parity, memory admin UI, desktop/mobile/SaaS.
- Phase 0–6 execution — **approved direction, not started** (except partial Phase 0.3 this handoff).

### Next Agent Should Know

- **Start here:** `docs/plans/public-launch-plan.md` then `docs/product-soul.md`.
- **Architecture:** Web → api-server → `lib/ember-core` → SQLite; MCP → ember-mcp → same core/DB.
- **Ember UI:** `ember-design-constraints` + `docs/visual-direction.md` before any design work.
- **Tests:** `cd lib/ember-core && pnpm test`; full monorepo typecheck per repo scripts.
- **Agent-loom sync:** rsync only into Ember; never edit `../agent-loom`. Checklist in `.agents/EMBER-SKILLS.md`; `agent-loom-sync.json` @ `2a796a7`.
- **No InsightTray yet** — Phase 3; grep confirms component not created.

### Revisit Triggers

- User says “sync agent-loom” → `.agents/EMBER-SKILLS.md` merge checklist; preserve `ember-design-constraints`.
- User picks a launch phase → implement PRs in plan order; update handoff per phase.
- Investor / Show HN prep → `?demo=1` path + `docs/show-hn.md` (Phase 5.3, not written yet).

### Working Tree

- Clean on `main`; latest commit `da8ae9a` (svg-creation sync). Pushed to origin.

---

## 2026-07-03 20:01 — Handoff

### Done

- Merged `.agents/` from sibling repo `../agent-loom` into Ember (all upgraded skills + 27 new skills: memory suite, design-direction, design-system, venture-exploration, knowledge-graph, etc.)
- Preserved Ember-specific skills: `design-archetype`, `design-tokens-craft`, `icon-craft`
- Created hybrid `frontend-design` v2.1-ember with pipeline auto-selection (Ember path vs loom default path)
- Added `.agents/EMBER-SKILLS.md` (merge notes + future sync checklist)
- Extended `.agents/ROUTING.md` with Ember overrides section
- Updated `deprecate-skill/references/deprecation-log.md` — notes Ember retention of legacy design skills
- Restored root `AGENTS.md` and `docs/visual-direction.md` from `.migration-backup/`
- Preserved `.agents/agent_assets_metadata.toml` (dragon image URIs)

### Debated

- **Replace vs keep legacy design trio:** Upstream deprecated `design-archetype` / `design-tokens-craft` / `icon-craft` in favor of `design-direction` + `design-system`. Kept both — Ember visual identity (cozy dark, dragon forge, ember tokens) was built on the archetype pipeline; loom v2 used for non-Ember UI.

### Decisions

- **Dual pipeline in `frontend-design`:** Ember path when `docs/visual-direction.md` exists, product-soul names Ember, or user requests dragon/Ember UI. See `.agents/skills/frontend-design/references/ember-design-flow.md`.
- **Future agent-loom syncs:** rsync loom → restore 3 Ember skills + `agent_assets_metadata.toml` + re-apply hybrid frontend-design. Checklist in `.agents/EMBER-SKILLS.md`.

### Deferred

- Restoring remaining docs from `.migration-backup/docs/` (PRD, build-plan, architecture-guard, etc.) — only `visual-direction.md` and `AGENTS.md` restored this session; user did not request full docs migration.
- Knowledge graph incremental build — optional; graph may be empty on first run.

### Next Agent Should Know

- Ember now has **101 skills** (98 loom + 3 Ember-specific). Do not deprecate the design trio in this repo.
- Read root `AGENTS.md` before Ember feature work.
- `docs/product-soul.md` exists; most other product docs still live under `.migration-backup/docs/` if needed.

### Revisit Triggers

- User asks to sync agent-loom again → follow `.agents/EMBER-SKILLS.md` merge checklist
- Frontend work on Ember product UI → Ember path in `frontend-design`, read `docs/visual-direction.md`

### Working Tree

- Clean after commit (design pipeline switch)

---

## 2026-07-03 20:18 — Handoff

### Done

- Adopted agent-loom design pipeline fully: `design-direction` → `design-system`
- Archived legacy skills to `.agents/skills/.deprecated/*-deprecated-2026-07-03/`
- Added `ember-design-constraints.md` — Ember token names, Resume Card, dragon UI rules
- Updated `frontend-design`, `design-direction`, `design-system`, `ROUTING.md`, `EMBER-SKILLS.md`
- Removed dual-pipeline / `ember-design-flow.md`

### Decisions

- Ember identity preserved via product docs + constraints reference, not separate skill chain
- `--color-ember-*` token naming must survive in DESIGN.md component contracts

### Next Agent Should Know

- Do not invoke `design-archetype`, `design-tokens-craft`, or `icon-craft` — archived
- Ember UI: load `ember-design-constraints` + read `docs/visual-direction.md` before design work

### Working Tree

- Clean after commit
