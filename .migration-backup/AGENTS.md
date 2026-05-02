# Ember Agent Rules

This repository is designed to be developed with the help of AI coding agents.

Before generating code, agents MUST read the documentation in the `/docs` folder.

Required reading:

docs/PRD.md  
docs/master-prompt.md  
docs/architecture-guard.md  
docs/backend-architecture.md  
docs/ai-system-architecture.md  
docs/memory-compression.md  
docs/resume-card.md  
docs/visual-direction.md  
docs/common-mistakes.md  
docs/build-plan.md  
docs/repo-map.md  


# What Ember Is

Ember is a **local-first ADHD productivity tool** where projects are represented as dragons that grow through focused work sessions.

The goal is **not task management**.

The goal is to help users:

- start work quickly
- maintain momentum
- restore project context
- feel emotional progress
- enjoy delightful experience

---

# Core Product Loop

Every feature must reinforce this loop:

Open project  
→ Brain dump thoughts  
→ AI extracts tasks  
→ Start focus session  
→ Reflect  
→ Dragon grows

---

# Architecture Constraints

Agents must follow the rules in `docs/architecture-guard.md`.

Key constraints:

- Next.js
- React
- TypeScript
- SQLite
- local-first architecture

Do NOT introduce:

- cloud databases
- external infrastructure
- unnecessary frameworks

---

# Development Order

Follow the build plan in:
docs/build-plan.md

Do not implement advanced features before the core loop works.

# AI System Behavior

The AI system is **not a chatbot**.

It is a **structured project cognition engine** that converts user thoughts into tasks, insights, and progress updates.

All AI responses must return structured JSON.

# Critical UX Principle

The system should make it extremely easy to:

Open Ember  
Understand where the user left off  
Start a 20-minute focus session

The Resume Card is the primary entry point into a project that has already been started.

# Failure Conditions

Agent implementations should be rejected if they:

- delete user data automatically
- bypass the service layer
- introduce unnecessary complexity