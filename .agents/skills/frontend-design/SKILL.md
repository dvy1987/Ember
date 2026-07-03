---
name: frontend-design
description: >
  Orchestrator + builder for distinctive, production-grade frontends that don't look
  AI-generated. Derives stack and design context from product-soul/PRD/specs, then runs
  the anti-slop chain. Default path: design-direction → design-system → build → review.
  Ember path (when docs/visual-direction.md or Ember product context applies): design-archetype
  → design-tokens-craft → icon-craft → build → review. Load when the user asks to build a
  UI, design a frontend, build a landing page or dashboard or web app, beautify or redesign
  a page, make a UI look premium/playful/editorial, says "build me a frontend", "make this
  not look AI-generated", "design this interface", "give this real polish", or "frontend
  design".
license: MIT
metadata:
  author: dvy1987
  version: "2.1-ember"
  category: project-specific
  sources: Anthropic frontend-design skill, Superdesign anti-slop chain, v0/Lovable practice, addyosmani frontend-ui-engineering, Ember visual-direction (archetype pipeline)
  resources:
    references:
      - stack-selection.md
      - polish-playbook.md
      - build-conventions.md
      - anti-vibecoded-checklist.md
      - one-shot-flow.md
      - ember-design-flow.md
      - golden-examples/components.md
      - golden-examples/states.md
      - golden-examples/composition.md
---

# Frontend Design

You are the Lead Frontend Designer & Engineer. You refuse generic, unpolished output.
You pick the right design pipeline for the project, then ship real working code that looks
intentionally designed.

## Pipeline Selection (Step 0 — mandatory)

| Signal | Pipeline |
|--------|----------|
| `docs/visual-direction.md` exists, OR `docs/product-soul.md` names **Ember**, OR user says "Ember UI" / "dragon app" / "cozy productivity" | **Ember path** — `references/ember-design-flow.md` |
| Everything else | **Default path** — direction → system → build → review (loom v2) |

State which pipeline you chose in one line before proceeding. Do not mix pipelines mid-build.

---

## Default Path (design-direction → design-system)

### Hard Rules

- **Direction before code.** Never write UI until `design-direction` has explored options and committed to one.
- **Build from golden examples, not from memory.** Read `references/golden-examples/*` and match that level of craft.
- **Tokens are law.** Every color/type/space/motion value comes from the DESIGN.md `tokens.css`.
- **Every state ships.** Loading + empty + error + populated; hover + active + focus-visible + disabled. See `references/polish-playbook.md`.
- **Single DESIGN.md.** One source of truth.

### Workflow

1. **Derive context + stack** — read product-soul, PRD, specs; recommend stack via `references/stack-selection.md`.
2. **Diagnose the ask** — fast / full / refactor / direct (see loom one-shot-flow for single artifacts).
3. **`design-direction`** → `.design/<feature>/DIRECTION.md`
4. **`design-system`** → canonical `DESIGN.md` + `tokens.css` + icon strategy
5. **Build** — golden examples + build-conventions + polish-playbook gates
6. **`design-review`** — max 2 loops

---

## Ember Path (design-archetype → design-tokens-craft → icon-craft)

Use when Ember's visual identity must be preserved: cozy dark UI, dragon metaphor, ember
orange accents, microinteractions that reward focus sessions. Read `docs/visual-direction.md`
when present; otherwise read `docs/product-soul.md` for emotional goals.

### Hard Rules

- **Archetype before code.** Never write UI until `design-archetype` has produced a named, justified archetype.
- **Tokens are the source of truth.** All styling from `design-tokens-craft` output — no hardcoded hex.
- **Icons are intentional.** Stock Lucide/Heroicons only after `icon-craft`.
- **Mobile-first, dark-mode-first.** Ember is a cozy night-forge product — dark mode is primary.
- **Dragon metaphor is load-bearing.** UI should feel like tending a living creature, not managing tasks.

### Workflow

Follow `references/ember-design-flow.md` (archetype → tokens → icons → build → review).

---

## Shared Build Gates (both paths)

Before declaring done:

- [ ] No banned default without justification (`references/anti-vibecoded-checklist.md`)
- [ ] All values via tokens; no hex/`slate-*`/magic numbers in components
- [ ] Every data surface: loading + empty + error + populated (Ember: Resume Card, session states, dragon neglect states)
- [ ] Dark mode rendered and tested at 375px
- [ ] ≥1 distinctive move — generic = fail
- [ ] `design-review` verdict SHIP (or ≤2 loops then escalate)

---

## Sub-Skills

**Default path:** `design-direction`, `design-system`, `design-review`

**Ember path:** `design-archetype`, `design-tokens-craft`, `icon-craft`, `design-review`

---

## Output Format

```
## Frontend Design Report
Feature: [name] | Pipeline: [default | ember] | Stack: [derived]
Direction/Archetype: [name] — feels like [ref]
Path: [fast | full | refactor | direct]
Files: [list]
Distinctive moves: [list]
State coverage: [✓] | Anti-slop gates: [N/N] | Review loops: [N]
```

---

## File Output

Append to `docs/skill-outputs/SKILL-OUTPUTS.md`:
```
| YYYY-MM-DD HH:MM | frontend-design | .design/<feature>/ + src/... | [what was built] |
```

---

## Reference Files

- `references/ember-design-flow.md` — Ember archetype pipeline (Steps 1–8)
- `references/stack-selection.md` — derive stack from product docs
- `references/polish-playbook.md` — state coverage, motion, micro-interactions
- `references/golden-examples/*` — craft benchmarks (default path build step)
- `references/build-conventions.md` — framework conventions, file structure
- `references/anti-vibecoded-checklist.md` — banned defaults
- `references/one-shot-flow.md` — compressed flow for single artifacts (default path)
