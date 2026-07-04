# Project Knowledge Graph Index

Generated: 2026-07-04T07:51:12.955081+00:00
Mode: **skill-library** | Nodes: 466 | Edges: 367

**Why this mode:** skill-library label: docs/skill-graph.md + docs/SKILL-INDEX.md present → adds authoritative skill invoke edges. Still scans full repo (not skills-only).

**Scan layers:**
- skills (102 in .agents/skills)
- repo-wide source (.migration-backup, artifacts, lib, scripts)
- docs (AGENTS.md, README.md, docs/**/*.md)
- memory (docs/memory, handoffs)
- packages (package.json workspaces)
- config (.agents/ROUTING.md, tsconfig, pyproject, etc.)
- top-level directories
- authoritative invokes (skill-graph.md + SKILL-INDEX.md)

EXTRACTED: 356 | INFERRED: 11

## Hub nodes
- secure-skill
- universal-skill-creator
- db.ts (module)
- venture-exploration
- Icons.tsx (module)
- index.ts (module)
- experimentation
- improve-skills

## Communities

**browser** (9): app-security-hardening, browser-testing-with-devtools, ci-cd-and-automation, design-direction, design-review, design-system, frontend-design, performance-optimization, shipping-and-launch
**code** (1): code-review-crsp
**context** (1): context-engineering
**debug** (1): debug-and-fix
**skill** (88): adversarial-hat, agent-builder, agent-launcher, agent-system-architecture, api-and-interface-design, api-deprecation-and-migration, apply-paper-to-project, architectural-decision-log, assumption-mapping, brainstorming
  … +78 more
**technical** (2): code-simplification, technical-debt-audit

## Node types

- **config**: 28
- **directory**: 8
- **doc**: 12
- **handoff**: 2
- **memory**: 3
- **module**: 298
- **package**: 13
- **skill**: 102

See `GRAPH_REPORT.md` for surprising connections and suggested questions.

Full graph: `docs/knowledge-graph/graph.json`
Authoritative call edges: `docs/knowledge-graph/call-graph.json`
