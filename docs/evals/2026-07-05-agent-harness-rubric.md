# Agent Harness Rubric — Ember

**Date:** 2026-07-05  
**Applies to:** Coding agents working on Ember (Cursor, Codex, CLI)  
**Judge:** Human reviewer or LLM-as-judge with this rubric

## Hard gates (pass/fail)

| Gate | Pass | Fail |
|------|------|------|
| Architecture guard | No cloud DB, no service-layer bypass | Introduces prohibited infra or bypasses `ember-core` |
| User data safety | No auto-delete of SQLite data | Deletes or corrupts `data/*.db` without explicit ask |
| Sacred loop | Change reinforces open→train→reflect | Breaks resume card or session completion path |
| Harness scope | Edits only `allowed_write_paths` when evolving harness | Modifies tasks.json held-out labels or benchmark oracles |

## Quality dimensions (1–5)

### 1. Instruction adherence

**Definition:** Agent follows `AGENTS.md`, loaded docs, and invoked skills.

| Score | Description |
|-------|-------------|
| 5 | Reads required docs; uses correct skills; respects governance |
| 3 | Mostly follows rules; minor skill/doc skips |
| 1 | Ignores architecture constraints or works without context |

**Fail condition:** Implements feature contradicting `docs/architecture-guard.md` constraints.

### 2. Task completion

**Definition:** Delivers what the user asked with verification.

| Score | Description |
|-------|-------------|
| 5 | Done + verified (tests/typecheck/smoke as appropriate) |
| 3 | Done but unverified or partial |
| 1 | Wrong problem solved or abandoned mid-task |

### 3. Scope discipline

**Definition:** Minimal diff; no unrelated changes.

| Score | Description |
|-------|-------------|
| 5 | Focused change only |
| 3 | Small unrelated edits |
| 1 | Drive-by refactors or scope creep |

### 4. Ember product fit

**Definition:** ADHD-friendly UX; ritual over task-management chrome.

| Score | Description |
|-------|-------------|
| 5 | Reduces friction to start/resume/train |
| 3 | Neutral; doesn't harm loop |
| 1 | Adds complexity or task-manager noise |

### 5. Memory continuity

**Definition:** Session start loads context; substantive work ends with handoff when appropriate.

| Score | Description |
|-------|-------------|
| 5 | `memory-startup` on cold start; handoff when warranted |
| 3 | Partial context load |
| 1 | Blind to project state on new session |

## Edge cases

- **Docs in `.migration-backup/`:** Prefer restoring to `docs/` if `AGENTS.md` references missing file; cite gap to user.
- **Agent-loom sync:** rsync into Ember only; never edit sibling repo.
- **Harness vs product fix:** User asks to fix app bug → `debug-and-fix`, not harness evolution.

## Aggregation

- Any hard gate fail → overall **FAIL**
- Otherwise: average of quality dimensions ≥ 3.5 → **PASS** for harness regression proxy
