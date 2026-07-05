# Knowledge Graph Report

Generated: 2026-07-05T04:49:13.993064+00:00
Mode: skill-library | Nodes: 510 | Edges: 429

**Why this mode:** skill-library label: docs/skill-graph.md + docs/SKILL-INDEX.md present → adds authoritative skill invoke edges. Still scans full repo (not skills-only).

## God nodes (skills + modules)
- db.ts (module)
- Icons.tsx (module)
- secure-skill
- universal-skill-creator
- index.ts (module)
- venture-exploration
- projectService.ts (module)
- experimentation
- validate-skills
- ritual.ts (module)

## Surprising cross-community connections
- project-orchestrator → skill-routing (invokes: project ↔ skill)
- project-orchestrator → process-decomposer (invokes: project ↔ process)
- motion-animation → svg-creation (invokes: motion ↔ svg)
- publish-skill → validate-skills (invokes: publish ↔ validate)
- publish-skill → improve-skills (invokes: publish ↔ improve)
- customer-discovery → venture-exploration (invokes: customer ↔ venture)
- harness-evolution → eval-pipeline (invokes: harness ↔ eval)
- reality-check → assumption-mapping (invokes: reality ↔ assumption)

## Suggested questions
- How does project-orchestrator (project) connect to skill-routing (skill)?
- How does project-orchestrator (project) connect to process-decomposer (process)?
- How does motion-animation (motion) connect to svg-creation (svg)?
- What depends on db.ts (module), and what does db.ts (module) invoke?
- What depends on Icons.tsx (module), and what does Icons.tsx (module) invoke?
- What depends on secure-skill, and what does secure-skill invoke?

## Provenance
- Authoritative invokes: 170
- EXTRACTED: 415 | INFERRED: 14

Query: `python3 .agents/skills/knowledge-graph/scripts/query_graph.py path <A> <B>`
