# Ember Agent Harness — Middleware

Lifecycle hooks and cross-cutting behavior between user message and agent action.

## Session start (cold)

1. **`memory-startup`** — mandatory on first user message; load `docs/memory/` via routing
2. Read `AGENTS.md` required docs list before feature work
3. **`ember-design-constraints`** before any Ember UI change

## Session continuity

- **`memory-handoff`** — end of substantive sessions; update `docs/memory/agent-handoffs.md`
- Prefer `docs/memory/current-state.md` for project snapshot

## Skill routing

- Default: agent-loom skills in `.agents/skills/` per `.agents/ROUTING.md`
- Ember overrides in `.agents/ROUTING.md` § Ember overrides
- Protected skill: `ember-design-constraints`

## Harness drift

Run `./scripts/harness-sync-check.sh` before committing harness edits or after agent-loom sync.

## Compaction (future)

Long sessions: distill to handoff + `current-state.md`; do not rely on chat history alone.
