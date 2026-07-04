---
name: ember-design-constraints
description: >
  Ember-specific visual and UX constraints for the loom design pipeline. Load before any Ember
  UI work — building screens, redesigning components, design-direction exploration, DESIGN.md
  tokens, or design-review on this repo. Enforces creature-companion identity, Resume Card
  hierarchy, --color-ember-* tokens, dragon accents, and mandatory UI states. Read alongside
  docs/visual-direction.md and docs/product-soul.md.
license: MIT
metadata:
  author: dvy1987
  version: "1.0"
  category: project-specific
  origin: project-local
  resources:
    references:
      - ember-design-constraints.md
---

# Ember Design Constraints

Product-specific gates for `frontend-design`, `design-direction`, `design-system`, and
`design-review` when working on Ember UI.

## When to load

- Any Ember frontend build, redesign, or polish
- Before `design-direction` explores directions for this repo
- Before `design-system` writes `DESIGN.md` token contracts
- Before `design-review` on Ember screens

## Workflow

1. Read `docs/visual-direction.md` and `docs/product-soul.md`
2. Read `references/ember-design-constraints.md` — tokens, Resume Card, dragon UI, states
3. Run the standard chain: `frontend-design` → `design-direction` → `design-system` → build → `design-review`
4. Verify Ember-specific checklist items in the constraints reference

## Hard rules

- Ember is a **living creature companion**, not a task manager
- Preserve `--color-ember-*` token names; no raw hex in components
- Resume Card is the primary entry — single hero CTA
- Every data screen ships loading, empty, error, and populated states

## Verification

- [ ] Output feels like training a creature, not managing tasks
- [ ] Resume Card hierarchy correct when applicable
- [ ] Ember token names used in components
- [ ] Focus session screen stays calm (no clutter)
