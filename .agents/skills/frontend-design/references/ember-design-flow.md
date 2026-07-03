# Ember Design Flow

Archetype-driven pipeline for Ember UI work. Preserves the three-skill design suite
(`design-archetype` → `design-tokens-craft` → `icon-craft`) tuned for Ember's cozy
dragon-forge visual identity.

Read `docs/visual-direction.md` first when it exists. Otherwise anchor on
`docs/product-soul.md` emotional goals: low activation energy, ritual over task management,
dragon growth as progress feedback.

---

## Step 1 — Diagnose the Ask

| Signal | Path |
|--------|------|
| Single screen / component / mockup | **Fast** — archetype → tokens → build → review |
| Full app or multi-page flow | **Full** — archetype → research → tokens → icons → build → review |
| Beautify / redesign existing Ember UI | **Refactor** — read existing, archetype-fit, tokens diff, build, review |
| One isolated step | **Direct** — invoke that sub-skill only |

For Ember, default archetype hint when unspecified: **playful-consumer** or **premium-consumer**
with cozy-dark, ember-warm accents — not enterprise-trust or brutalist-distinctive unless the
user asks.

---

## Step 2 — Run `design-archetype`

Invoke `design-archetype`. Output: archetype name, typography pair, color logic, motion
philosophy, density, icon stance, reference sites, `feels like X` claim.
Write to `.design/<feature>/ARCHETYPE.md`.

Pass Ember context: ADHD productivity, dragon metaphor, focus-session ritual, Resume Card
as primary entry.

---

## Step 3 — (Conditional) Visual Research

If ambiguity ≥ 6/10 or archetype requests it, fetch 2–3 reference sites. Record concrete
moves (not "use Notion" — actual spacing, type scale, motion budget). Save to
`.design/<feature>/RESEARCH.md`.

---

## Step 4 — Run `design-tokens-craft`

Invoke `design-tokens-craft` with ARCHETYPE.md. Output `tokens.css` + `TOKENS.md`.
Ember token names should follow existing conventions when present (`--color-ember-cinder`,
`--color-ember-panel`, dragon-type accent vars). Reject generic Inter-on-purple defaults.

---

## Step 5 — Run `icon-craft`

Invoke `icon-craft` with archetype + tokens. Ember favors warm, hand-tuned icons over stock
Lucide defaults. Dragon and forge motifs should feel intentional, not clip-art.

---

## Step 6 — Build

Implement using only archetype, tokens, and icon output. Read `build-conventions.md`.
Apply `polish-playbook.md` state coverage — especially:

- Resume Card: loading / empty project / populated states
- Dragon cards: active / sleepy / restless / decaying neglect states
- Focus timer: running / paused / complete
- Session reflection flow

Mandatory gates:

- [ ] Ember color tokens used (no raw hex in components)
- [ ] Dark mode primary; light mode if required is hand-set
- [ ] Microinteractions on dragon growth, session complete, task check-off
- [ ] Resume Card answers "where was I" in <3 seconds of visual scan

---

## Step 7 — Run `design-review`

Invoke `design-review` against the `feels like X` claim and Ember product principles
(ritual, not task manager). Max 2 loops.

---

## Step 8 — Deliver

Output file tree, running route/mockup, and impact report.

---

## One-Shot Ember Artifacts

For isolated mockups in `artifacts/mockup-sandbox/`, compress to:

1. Pick archetype in 30s (usually playful-consumer + cozy-dark)
2. Inline minimal token set at top of CSS
3. ≤4 icons as inline SVG or one tuned source
4. One distinctive move (dragon glow, ember particle, asymmetric resume layout)
5. Self-review against `anti-vibecoded-checklist.md`

Skip separate ARCHETYPE.md for throwaway mockups; record direction as a one-line HTML comment.
