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

`skills/frontend-design/references/ember-design-constraints.md` threads into the loom pipeline:

- Read `docs/visual-direction.md` + `docs/product-soul.md` at Step 0
- Preserve `--color-ember-*` token naming in `DESIGN.md`
- Resume Card hierarchy, dragon accents, focus-session calm, state coverage

`design-direction` and `design-system` include Ember hooks when `docs/visual-direction.md` exists.

---

## Project docs agents must read

Root `AGENTS.md` lists Ember-specific required reading. Do not replace with generic agent-loom AGENTS.md.

### Agent assets

`.agents/agent_assets_metadata.toml` — generated dragon image asset URIs.

---

## Merge checklist (future agent-loom syncs)

1. `rsync` agent-loom `.agents/` → Ember (exclude `.deprecated/`)
2. Restore `agent_assets_metadata.toml`
3. Re-apply `ember-design-constraints.md` and Ember hooks in `frontend-design`, `design-direction`, `design-system`
4. Keep root `AGENTS.md` and `docs/visual-direction.md`
5. Do **not** restore `design-archetype`, `design-tokens-craft`, `icon-craft` unless explicitly requested
