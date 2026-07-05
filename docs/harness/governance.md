# Ember Agent Harness — Governance

Cross-cutting rules for what agents may read, write, and execute.

## Forbidden paths (never write without explicit user ask)

- `.env`, `.env.*`, credentials, API keys, tokens
- `data/*.db` — user data; never delete or auto-migrate destructively
- `node_modules/`, build artifacts (`dist/`, `.next/`)
- Destructive git: `reset --hard`, `push --force` to `main`/`master`
- `../agent-loom/` — sync source only; never edit sibling repo from Ember

## Allowed write paths (harness evolution)

Agents improving the harness may edit only:

- `docs/harness/`
- `AGENTS.md` (merge; preserve user interview content)
- `docs/evals/` (rubrics and eval configs tied to harness)

Product code changes follow normal PR workflow — not harness evolution surfaces.

## Ember product guardrails

From `AGENTS.md` and architecture constraints:

- **Local-first** — no cloud databases or external infrastructure
- **Service layer** — UI/API must not bypass `lib/ember-core`
- **Sacred loop** — features must reinforce open → brain dump → train → reflect → grow
- **No auto-delete** — never delete user data automatically
- **Simplicity** — reject unnecessary complexity

## Verifier sandbox (harness evolution)

When `harness-evolution` runs:

- Cannot disable eval interface or remove held-out split
- Cannot raise token budgets or swap models without user approval
- `docs/harness/runs/` is read-only for analysis
- Benchmark tasks and held-out labels are immutable

## Skill protection

- **Protected:** `.agents/skills/ember-design-constraints/` — do not overwrite on agent-loom sync
- **Routing:** Prefer agent-loom skills per `.agents/ROUTING.md`
