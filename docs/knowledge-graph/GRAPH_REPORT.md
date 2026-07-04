# Knowledge Graph Report

Generated: 2026-07-04T07:51:12.955081+00:00
Mode: skill-library | Nodes: 466 | Edges: 367

**Why this mode:** skill-library label: docs/skill-graph.md + docs/SKILL-INDEX.md present → adds authoritative skill invoke edges. Still scans full repo (not skills-only).

## God nodes (skills + modules)
- secure-skill
- universal-skill-creator
- db.ts (module)
- venture-exploration
- Icons.tsx (module)
- index.ts (module)
- experimentation
- improve-skills
- validate-skills
- memory

## Surprising cross-community connections
- project-orchestrator → skill-routing (invokes: project ↔ skill)
- project-orchestrator → process-decomposer (invokes: project ↔ process)
- publish-skill → validate-skills (invokes: publish ↔ validate)
- publish-skill → improve-skills (invokes: publish ↔ improve)
- customer-discovery → venture-exploration (invokes: customer ↔ venture)
- reality-check → assumption-mapping (invokes: reality ↔ assumption)
- reality-check → adversarial-hat (invokes: reality ↔ adversarial)
- business-modeling → venture-exploration (invokes: business ↔ venture)

## Suggested questions
- How does project-orchestrator (project) connect to skill-routing (skill)?
- How does project-orchestrator (project) connect to process-decomposer (process)?
- How does publish-skill (publish) connect to validate-skills (validate)?
- What depends on secure-skill, and what does secure-skill invoke?
- What depends on universal-skill-creator, and what does universal-skill-creator invoke?
- What depends on db.ts (module), and what does db.ts (module) invoke?

## Provenance
- Authoritative invokes: 170
- EXTRACTED: 356 | INFERRED: 11

Query: `python3 .agents/skills/knowledge-graph/scripts/query_graph.py path <A> <B>`
