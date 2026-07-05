# Ember-Specific Agent Configuration

This file documents how the Ember repo differs from upstream **agent-loom** after merges.

---

## Design pipeline (adopted from agent-loom)

Ember uses the standard loom design chain for all UI work:

```
frontend-design → design-direction → design-system → build → design-review
```

The deprecated archetype pipeline (`design-archetype`, `design-tokens-craft`, `icon-craft`)
was archived 2026-07-03. Ember identity is preserved via product docs + constraints reference,
not a separate skill chain.

### Ember design constraints

`skills/ember-design-constraints/` (project-local) threads into the loom pipeline:

- Load `ember-design-constraints` before any Ember UI work
- Read `docs/visual-direction.md` + `docs/product-soul.md` at Step 0
- Preserve `--color-ember-*` token naming in `DESIGN.md`
- Resume Card hierarchy, dragon accents, focus-session calm, state coverage

---

## Project docs agents must read

Root `AGENTS.md` lists Ember-specific required reading. Do not replace with generic agent-loom AGENTS.md.

### Agent assets

`.agents/agent_assets_metadata.toml` — generated dragon image asset URIs.

---

## Merge checklist (future agent-loom syncs)

1. `rsync` agent-loom `.agents/` → Ember (exclude `.deprecated/`)
2. Restore `agent_assets_metadata.toml`
3. Keep `ember-design-constraints` skill (project-local) — do not delete on sync
4. Keep root `AGENTS.md` and `docs/visual-direction.md`
5. Do **not** restore `design-archetype`, `design-tokens-craft`, `icon-craft` unless explicitly requested

### Last sync: 2026-07-05 (91824b2)

Synced from agent-loom commit `91824b2`:

- **Updated:** `memory-startup` (v1.4 — deferred.md OPEN-only filter; already matched from prior partial sync)
- **Updated:** `agent-loom-sync` — upstream rsync (was incorrectly stamped `origin: project-local` in Ember, blocking updates; now includes auto-stamp for local-only skills)
- **Unchanged (107):** all other library skills
- **Docs synced:** `docs/SKILL-INDEX.md`, `docs/SKILL-EXAMPLES-INDEX.md`, `docs/skill-graph.md`
- **Protected:** `ember-design-constraints` (project-local)
