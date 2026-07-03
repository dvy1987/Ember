# Agent Handoffs

Session continuity log for Ember. Newest entries at top.

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

- Clean after commit (this handoff + full `.agents` merge staged)
