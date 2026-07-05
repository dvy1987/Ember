# Ember Agent Harness — Sub-agents

Ember development uses a **single primary agent** by default. Multi-agent topology is optional.

## Default topology

| Role | Implementation |
|------|----------------|
| Primary coder | Cursor / Codex agent with `AGENTS.md` + skills |
| Product cognition | `lib/ember-core` + MCP tools (not a separate chatbot) |

## Optional Task subagents

Use platform `Task` tool when:

- Broad codebase exploration (`generalPurpose`)
- Bugbot / security review on request (`bugbot`, `security-review`)
- Parallel doc + code investigation

Do **not** require multi-agent chains for routine Ember features.

## Orchestration map

| Intent | Skill |
|--------|-------|
| New session | `memory-startup` |
| Feature design | `brainstorming` → `implementation-plan` |
| Ember UI | `frontend-design` + `ember-design-constraints` |
| Debug | `debug-and-fix` |
| Harness work | `harness-engineering` |
| Agent-loom sync | `agent-loom-sync` |
| Launch / Show HN | `docs/show-hn.md` checklist (human-led) |

Full index: `docs/SKILL-INDEX.md`
