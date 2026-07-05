# Ember public launch — implementation plan

**Created:** 2026-07-05  
**Status:** Implemented (2026-07-05)  
**North star:** A stranger installs locally, opens Ember, understands “my dragon remembers,” starts training in <30s, finishes a session, sees updated memory + ritual stats — and power users complete the same jobs from Cursor via MCP.

---

## Locked decisions (from product Q&A)

| Topic | Decision |
|-------|----------|
| **Goal** | Public launch (Show HN, etc.) |
| **AI** | BYOK; intelligence via **MCP** in Cursor/Codex/CLI (bring your own AI subscription) |
| **Cognition UI** | **Insight tray** in the product — users see memory / contradictions |
| **Distribution** | **Local web app** now; desktop, hosted SaaS, **mobile later** |
| **Session length** | User picks length (15 / 20 / 25 / 45); **20 minutes default** everywhere |
| **Ritual metrics** | **Users** see them in Insights / dragon stats |

## Explicitly out of scope for launch

- Bundled / server-paid AI
- Desktop app, mobile app, hosted SaaS
- Full knowledge-graph UI as primary surface
- LLM-based skill orchestrator routing
- Full MCP API parity with web
- Heavy memory management admin UI

---

## Architecture spine

```
Web UI (artifacts/ember)  →  api-server  →  lib/ember-core  →  SQLite
Cursor / CLI              →  ember-mcp   →  lib/ember-core  →  same DB
```

All new domain logic goes in **`lib/ember-core`** first; HTTP and MCP are thin adapters.

---

## Phase 0 — Repo hygiene & launch docs

**Duration:** 1–2 days  
**Goal:** Clean baseline + “how to try Ember” in one page.

### PR-0.1 — Commit pending agent-loom sync

- Commit agent-loom sync (`613bba2`: `gsap-animation`, `motion-animation`, `svg-creation` + 102 updates).
- **AC:** `agent-loom-sync.json` reflects upstream; `ember-design-constraints` untouched.

### PR-0.2 — Launch README section

- **Files:** `README.md` or `docs/launch.md`
- **Content:** install, build, start api-server + UI, `/?demo=1`, link `docs/mcp-setup.md`, BYOK env vars.
- **AC:** New user can follow without author help.

### PR-0.3 — Refresh memory docs

- **Files:** `docs/memory/current-state.md`, `docs/memory/agent-handoffs.md`
- **AC:** Reflect ember-core, MCP, walkthrough mode, launch direction.

---

## Phase 1 — Configurable session length (default 20)

**Duration:** 3–4 days  
**Goal:** User picks 15 / 20 / 25 / 45; everything defaults to 20.

### PR-1.1 — Persist preference in settings

- **Core:** settings key `default_session_minutes` (default `20`, allowed `[15, 20, 25, 45]`).
- **API:** `GET/PATCH /api/settings` or dedicated session settings route.
- **AC:** Survives restart; invalid values → 400.

### PR-1.2 — Session start uses chosen duration

- **Schema:** `sessions.planned_duration_minutes INTEGER DEFAULT 20`
- **API:** `POST /api/sessions/start` accepts optional `duration_minutes`; defaults from settings.
- **AC:** Ended session records actual + planned duration.

### PR-1.3 — UI picker + propagate labels

- **Files:** `demoMode.ts`, `FocusTimer.tsx`, `ResumeCard.tsx`, `HeroDragonCard.tsx`, `SessionPage.tsx`
- **UI:** Chips `15 · 20 · 25 · 45` on Resume Card or pre-session; Settings duplicate optional.
- **AC:** New user sees 20 without touching picker; change persists for next session.

### PR-1.4 — MCP `ember_begin_training` duration

- **Param:** `duration_minutes?: number` on `ember_begin_training`.
- **AC:** Cursor agent can start non-20-min sessions; tool description updated.

### PR-1.5 — Tests

- **Files:** `lib/ember-core/src/ritual.test.ts`
- **AC:** Default 20; setting change reflected in `beginTraining`.

---

## Phase 2 — Ritual metrics for users (Insights redesign)

**Duration:** 4–5 days  
**Goal:** Insights answers “am I building the habit?” not generic task analytics.

### PR-2.1 — Aggregate ritual metrics server-side

- **Core:** `ritualMetricsService.getRitualSummary()` — median time-to-train, sessions this week, days active (14d), etc.
- **API:** `GET /api/analytics/ritual`
- **AC:** Sensible numbers with ≥1 session; empty state when none.

### PR-2.2 — Insights page rewrite

- **Files:** `AnalyticsPage.tsx`, `ProjectAnalyticsPage.tsx`
- **Hero metrics:**
  1. Days you came back (14-day)
  2. Sessions this week
  3. Typical time to start (plain language)
  4. Focus minutes this week (keep weekly bar)
- **Per-dragon:** minutes, last tended, stage — not task dashboards.
- **AC:** Matches product soul; demo mode may hide nav link.

### PR-2.3 — Post-session nudge

- **File:** `SessionCompletePayoff.tsx` — one streak / sessions-this-week line.
- **AC:** Shown after complete when data exists.

### PR-2.4 — OpenAPI + types

- **Files:** `lib/api-spec/openapi.yaml`, regenerate clients if used.
- **AC:** `pnpm run typecheck` passes.

---

## Phase 3 — Insight tray (product cognition)

**Duration:** 5–7 days  
**Goal:** Users see “what your dragon remembers” without a graph UI.

### PR-3.1 — Insight bundle API

- **Core:** `insightTrayService.ts` — insights + `project_memory` + saga; rule-based contradiction v1.
- **API:** `GET /api/projects/:id/insights-tray`
- **AC:** Demo project returns items; empty project has friendly empty state.

### PR-3.2 — `InsightTray` component

- **File:** `artifacts/ember/src/components/InsightTray.tsx`
- **Placement:** `ProjectPage.tsx` below Resume Card, above brain dump (not in “More tending”).
- **UI:** “What your dragon holds”; contradiction badge; dismiss/snooze v1.
- **AC:** Loading / empty / error states per `ember-design-constraints`.

### PR-3.3 — Refresh after session

- **AC:** Tray updates after “Remember this session” when user returns to project.

### PR-3.4 — MCP resource (optional)

- **Resource:** `ember://project/{id}/insights-tray`
- **AC:** Agent reads same bundle as UI.

---

## Phase 4 — MCP + BYOK launch path

**Duration:** 3–4 days  
**Goal:** Show HN audience uses Ember from Cursor with existing AI subscription.

### PR-4.1 — MCP setup as primary onboarding path

- **Files:** `docs/mcp-setup.md`, `README.md`, `SettingsModal` → “Use from Cursor”
- **AC:** Non-author connects MCP in <10 min.

### PR-4.2 — Web BYOK without shame

- **When AI off:** Copy points to MCP as first-class path; no bundled key.
- **AC:** First-run doesn’t feel broken.

### PR-4.3 — MCP tool copy audit

- **File:** `artifacts/ember-mcp/src/server.ts` — ritual language, duration param, job-oriented descriptions.
- **AC:** Tools read like user jobs, not CRUD.

### PR-4.4 — `ember_health` enrichment

- **Returns:** `ai_via`, `mcp_version`, `db_path`.
- **AC:** Agent knows if brain dump will work.

---

## Phase 5 — Show HN readiness

**Duration:** 4–5 days  
**Goal:** Stranger → habit in one sitting.

### PR-5.1 — First-run activation

- Bootstrap demo or hatch with guided prompt; track `first_session_completed`.
- **AC:** Day-1 activation = one completed session.

### PR-5.2 — Demo vs real mode

- **`?demo=1`:** 1-min walkthrough; banner explains.
- **Normal:** full BYOK/MCP path.
- **AC:** HN post can link both paths.

### PR-5.3 — Launch assets

- **File:** `docs/show-hn.md` + screenshots (Keep hero, Insight tray, Insights ritual).

### PR-5.4 — Error & offline polish

- Audit fetch error states on Home, Session, Project.
- **AC:** api-server down → clear message, no blank screens.

---

## Phase 6 — Tests & confidence

**Duration:** 3–4 days

### PR-6.1 — Core ritual integration test

- openProject → beginTraining → finishTraining → resume changes.

### PR-6.2 — API smoke script

- **File:** `scripts/smoke-ritual.sh` — health, projects, session start/end, ritual analytics.

### PR-6.3 — Playwright happy path (optional, nightly CI)

- `/?demo=1` → Train → complete.

---

## Deferred (post-launch)

| Item | Trigger |
|------|---------|
| Desktop (Tauri/Electron) | Web retention proven |
| Mobile | Strong web usage or desktop shipped |
| Hosted SaaS + accounts | Paid tier without local install |
| Full MCP API parity | Power users request missing tools |
| LLM orchestrator routing | Spine stable 3+ months |
| Full knowledge graph UI | Insight tray insufficient |
| Memory management UI | Users need edit/delete often |

---

## Execution order

1. Phase 0 (docs/sync)
2. Phase 1 (session length) — **can parallel Phase 4**
3. Phase 2 (ritual Insights)
4. Phase 3 (insight tray)
5. Phase 4 (MCP/BYOK) — overlap with 2–3
6. Phase 5 (Show HN)
7. Phase 6 (tests)

**Minimum viable launch if timeboxed:** Phase 0 + 1 + 4 + 5.1 + 6.2. Insight tray is product-critical per decisions — prefer slipping Playwright over cutting Phase 3.

---

## Launch success metrics

| Metric | Target |
|--------|--------|
| Median open → timer start | < 30s |
| Day-1 activation | ≥ 1 completed session |
| Day-14 retention proxy | ≥ 40% with 4+ sessions (tune after cohort) |
| MCP setup | 3 external testers succeed from docs |
| Show HN | Post + install path work end-to-end |

---

## PR checklist template

```markdown
## [PR-X.Y] Title

### Why
One sentence tied to launch north star.

### Changes
- file: what

### Acceptance criteria
- [ ] ...
- [ ] typecheck passes
- [ ] ember-core tests pass

### Manual test
1. ...
```

---

## Related docs

- `docs/product-soul.md` — PMF bar and ritual definition
- `docs/mcp-setup.md` — MCP configuration
- `.agents/skills/ember-design-constraints/` — UI gates
- `.agents/EMBER-SKILLS.md` — agent-loom merge checklist
