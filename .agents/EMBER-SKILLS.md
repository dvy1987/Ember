# Ember-Specific Agent Skills

This file documents skills and routing that are **intentionally different** in the Ember
repo from the upstream agent-loom library. When merging from agent-loom, preserve these.

---

## Why Ember Differs

Ember is a local-first ADHD productivity app where projects are dragons. Its visual identity
(cozy dark forge, ember accents, dragon growth metaphor) was developed with a dedicated
three-skill design pipeline before agent-loom consolidated into `design-direction` +
`design-system`.

Ember keeps **both** pipelines: loom's upgraded default for generic UI, and Ember's
archetype pipeline for product UI.

---

## Ember-Only Skills (active — not deprecated here)

| Skill | Role |
|-------|------|
| `design-archetype` | Pick product archetype from curated catalog before Ember UI work |
| `design-tokens-craft` | Generate archetype-driven semantic tokens (`--color-ember-*` conventions) |
| `icon-craft` | Icon strategy that avoids generic Lucide-everywhere |

These are deprecated in upstream agent-loom (2026-06-30) but **remain active in Ember**.

---

## Ember Routing Overrides

### Frontend design

`frontend-design` v2.1-ember auto-selects pipeline:

- **Ember path** when `docs/visual-direction.md` exists, product-soul names Ember, or user
  requests Ember/dragon UI → `design-archetype` → `design-tokens-craft` → `icon-craft`
- **Default path** otherwise → `design-direction` → `design-system`

See `skills/frontend-design/references/ember-design-flow.md`.

### Project docs agents must read

Root `AGENTS.md` lists Ember-specific required reading (`docs/PRD.md`, `docs/visual-direction.md`,
`docs/architecture-guard.md`, etc.). Do not replace with generic agent-loom AGENTS.md.

### Agent assets

`.agents/agent_assets_metadata.toml` — generated dragon image asset URIs for Ember artifacts.

---

## New Skills from agent-loom (merged in)

All upstream upgrades are included: memory suite, knowledge-graph, venture-exploration,
idea-generation/evaluation, context-engineering, source-driven-development,
incremental-implementation, design-direction, design-system, git-workflow-and-versioning,
and all SKILL.md version bumps.

---

## Merge Checklist (for future syncs)

1. `rsync` agent-loom `.agents/` → Ember (exclude `.deprecated/`)
2. Restore `design-archetype`, `design-tokens-craft`, `icon-craft` from Ember or this doc's intent
3. Restore `agent_assets_metadata.toml`
4. Re-apply `frontend-design/SKILL.md` Ember hybrid (or merge carefully)
5. Keep `EMBER-SKILLS.md` and Ember section in `ROUTING.md`
6. Keep root `AGENTS.md` (Ember product rules, not loom generic)
