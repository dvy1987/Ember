# Project Knowledge Graph Index

Generated: 2026-07-05T02:11:13.626877+00:00
Mode: **skill-library** | Nodes: 493 | Edges: 399

**Why this mode:** skill-library label: docs/skill-graph.md + docs/SKILL-INDEX.md present → adds authoritative skill invoke edges. Still scans full repo (not skills-only).

**Scan layers:**
- skills (107 in .agents/skills)
- repo-wide source (.migration-backup, artifacts, lib, scripts)
- docs (AGENTS.md, README.md, docs/**/*.md)
- memory (docs/memory, handoffs)
- packages (package.json workspaces)
- config (.agents/ROUTING.md, tsconfig, pyproject, etc.)
- top-level directories
- authoritative invokes (skill-graph.md + SKILL-INDEX.md)

EXTRACTED: 389 | INFERRED: 10

## Hub nodes
- db.ts (module)
- secure-skill
- Icons.tsx (module)
- universal-skill-creator
- index.ts (module)
- venture-exploration
- experimentation
- validate-skills

## Communities

**ci** (12): app-security-hardening, browser-testing-with-devtools, ci-cd-and-automation, design-direction, design-review, design-system, frontend-design, gsap-animation, motion-animation, performance-optimization
  … +2 more
**code** (1): code-review-crsp
**context** (1): context-engineering
**create** (89): adversarial-hat, agent-builder, agent-launcher, agent-loom-sync, agent-system-architecture, api-and-interface-design, api-deprecation-and-migration, apply-paper-to-project, architectural-decision-log, assumption-mapping
  … +79 more
**debug** (1): debug-and-fix
**ember** (1): ember-design-constraints
**technical** (2): code-simplification, technical-debt-audit

## Node types

- **config**: 28
- **directory**: 9
- **doc**: 13
- **handoff**: 3
- **memory**: 3
- **module**: 317
- **package**: 13
- **skill**: 107

See `GRAPH_REPORT.md` for surprising connections and suggested questions.

Full graph: `docs/knowledge-graph/graph.json`
Authoritative call edges: `docs/knowledge-graph/call-graph.json`
