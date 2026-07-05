# Ember Agent Harness — Eval Interface

Regression surface for harness quality. Required before `harness-evolution`.

## Primary metric

**pass@1** — binary pass per task, averaged over rollouts.

- Default **k = 2** rollouts per task when evolution is planned
- Report held-in and held-out splits separately

## Regression command

```bash
./scripts/harness-regression.sh
```

Runs deterministic tasks from `docs/harness/tasks.json` (typecheck + ember-core tests). Smoke task is optional (requires api-server).

## Splits

| Split | Path | Purpose |
|-------|------|---------|
| Held-in | `docs/harness/splits/held-in.json` | Tune harness edits |
| Held-out | `docs/harness/splits/held-out.json` | Promotion gate |

## Promotion threshold (evolution)

Promote harness candidate only if:

- Held-in Δ ≥ 0 vs parent
- Held-out Δ ≥ 0 vs parent
- At least one split shows strict gain (max Δ > 0)

## Suite

Fast gate: `docs/harness/suite.json` — subset of held-in tasks for CI.

## Rubric

LLM-judge dimensions for agent behavior: `docs/evals/2026-07-05-agent-harness-rubric.md`

## Results log

Append promotion rounds to `docs/harness/results.tsv` (create on first evolution run).
