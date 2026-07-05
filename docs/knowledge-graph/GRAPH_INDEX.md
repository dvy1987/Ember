# Project Knowledge Graph Index

Generated: 2026-07-05T04:49:13.993064+00:00
Mode: **skill-library** | Nodes: 510 | Edges: 429

**Why this mode:** skill-library label: docs/skill-graph.md + docs/SKILL-INDEX.md present → adds authoritative skill invoke edges. Still scans full repo (not skills-only).

**Scan layers:**
- skills (110 in .agents/skills)
- repo-wide source ((root), .migration-backup, artifacts, lib, scripts, tests)
- docs (AGENTS.md, README.md, docs/**/*.md)
- memory (docs/memory, handoffs)
- packages (package.json workspaces)
- config (.agents/ROUTING.md, tsconfig, pyproject, etc.)
- top-level directories
- authoritative invokes (skill-graph.md + SKILL-INDEX.md)

EXTRACTED: 415 | INFERRED: 14

## Hub nodes
- db.ts (module)
- Icons.tsx (module)
- secure-skill
- universal-skill-creator
- index.ts (module)
- venture-exploration
- projectService.ts (module)
- experimentation

## Communities

**app** (12): app-security-hardening, browser-testing-with-devtools, ci-cd-and-automation, design-direction, design-review, design-system, frontend-design, gsap-animation, motion-animation, performance-optimization
  … +2 more
**code** (1): code-review-crsp
**context** (1): context-engineering
**debug** (1): debug-and-fix
**ember** (1): ember-design-constraints
**source** (92): adversarial-hat, agent-builder, agent-launcher, agent-loom-sync, agent-system-architecture, api-and-interface-design, api-deprecation-and-migration, apply-paper-to-project, architectural-decision-log, assumption-mapping
  … +82 more
**technical** (2): code-simplification, technical-debt-audit

## Node types

- **config**: 28
- **directory**: 10
- **doc**: 16
- **handoff**: 5
- **memory**: 3
- **module**: 325
- **package**: 13
- **skill**: 110

See `GRAPH_REPORT.md` for surprising connections and suggested questions.

Full graph: `docs/knowledge-graph/graph.json`
Authoritative call edges: `docs/knowledge-graph/call-graph.json`
