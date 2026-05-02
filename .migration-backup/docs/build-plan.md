# Ember Agent Guidelines
This repository is designed to be implemented with the help of AI coding agents.
This document defines how agents should behave when contributing code.
Agents must read the following documents before making changes:
- PRD.md
- master-prompt.md
- architecture-guard.md
- backend-architecture.md
- ai-system-architecture.md
- memory-compression.md
- resume-card.md
- visual-direction.md
- common-mistakes.md
- repo-map.md
- build-plan.md
These documents define the product philosophy, architecture, and behavioral constraints.

# Core Agent Principles
Agents should treat Ember as a **local-first productivity tool for ADHD users**.
The goal is not to build a generic task manager.
The goal is to create a system that makes it easy to:
- remember project context
- start work quickly
- maintain momentum
- visually track progress
Every implementation decision should support the core loop:
Open project  
→ Brain dump thoughts  
→ AI extracts tasks  
→ Start focus session  
→ Reflect  
→ Dragon progresses to the next stage after the required amount of focus time

# Architecture Constraints
Agents must follow the architecture guard rules.
Key constraints:
- Next.js + React + TypeScript
- SQLite database
- Local-first design
- No cloud infrastructure dependencies
- AI is deeply embedded but must not block core functionality
The system must work fully offline.

# Service Layer Rule
Business logic must live in services.
Allowed services:
services/
- projectService
- taskService
- sessionService
- dragonEngine
- aiService
- analyticsService
- contextBuilder (later stage)
UI components should remain lightweight.

# AI Behavior
The AI system is not a chatbot.
It is a **structured project cognition engine** that converts user thoughts into structured project data.
All AI outputs must return structured JSON.
Agents must validate AI responses before applying changes.

# Data Safety Rules
Agents must never implement features that automatically delete user data.
Memory compression must:
- summarize old session context
- reduce AI prompt size
- preserve all stored data
Tasks, sessions, and insights must remain stored.

# UX Priorities
The most important user experience rule:
Every screen should make it easier to start a **20-minute focus session**.
Avoid adding features that increase cognitive friction.
The Resume Card must remain the primary entry point into a project.

# Complexity Control
Agents should prefer:
- simple solutions
- readable code
- minimal dependencies
Avoid:
- unnecessary abstractions
- new frameworks
- complex infrastructure
Ember must remain easy for open-source contributors to understand.

# Implementation Steps (Agent Execution Order)
This section defines the **order** in which Ember should be implemented.
Agents must complete each phase before moving to the next.
The goal is to **build the core productivity loop first**, then layer additional systems.
# Phase 1 — Project Setup
Initialize the application structure.
Tasks:
1. Initialize **Next.js + TypeScript** project.
2. Create base repository structure:
/app
/components
/services
/db
/lib
/assets
/data
/docs
3. Configure linting and formatting.
4. Ensure the project runs locally.
Goal: A working empty application with correct folder structure.
# Phase 2 — Database Layer
Implement the SQLite database.
Tasks:
1. Install SQLite driver.
2. Create database setup:
db/db.ts
3. Create schema definition:
db/schema.ts
4. Implement database tables defined in `docs/backend-architecture.md`.
Tables:
projects
tasks
sessions
session_tasks
insights
milestones
settings
daily_stats
ai_logs

Note: `project_memory` may be added later after MVP.
Goal: SQLite database initializes automatically when the app starts.

# Phase 3 — Service Layer Foundation
Create the core services directory.
services/
Create empty service files:
projectService.ts
taskService.ts
sessionService.ts
dragonEngine.ts
analyticsService.ts
Do not implement AI services yet.
Goal: Service layer structure exists.

# Phase 4 — Project Service
Implement project management logic.
Responsibilities:
createProject
getProject
getAllProjects
updateProject
archiveProject
Project creation must include:
name
dragon_type
dragon_stage = egg
total_focus_minutes = 0

Goal: Projects can be created and stored in SQLite.

# Phase 5 — Task Service
Implement task management.
Responsibilities:
createTask
updateTask
completeTask
moveTaskToBacklog
moveTaskToActive
reorderTasks
Rules:
max active tasks = 5
Overflow tasks go to backlog.
Goal: Tasks can be created, updated, and reordered. Users can change which tasks are active tasks.

# Phase 6 — Session Service
Implement focus session tracking.
Responsibilities:
startSession
endSession
attachTasksToSession
storeReflection
updateFocusTime
Session end must update:
projects.total_focus_minutes
projects.last_session_at
Goal: Focus sessions are tracked and stored.

# Phase 7 — Dragon Engine
Implement dragon progression logic.
Responsibilities:
computeDragonStage
applyDecay
updateDragonState

Dragon stages:
egg → 0 minutes
hatchling → 20 minutes
adolescent → 120 minutes
adult → 840 minutes
ancient → 2400 minutes

Decay logic should evaluate:
last_session_at
last_decay_check
Goal: Dragon stage updates automatically from focus time.

# Phase 8 — Core API Routes
Create API routes connecting UI to services.
Examples:
/api/projects
/api/tasks
/api/sessions
Each route should:
1. validate input
2. call appropriate service
3. return JSON response
Goal: Frontend can interact with backend services.

# Phase 9 — Core UI
Implement the basic UI screens.
Required screens:
Home (dragon list)
Project screen
Focus session screen
Key components:
DragonCard
TaskList
FocusTimer
BrainDumpInput

Goal: User can create a project and run a focus session.

# Phase 10 — Resume Card
Implement the **Resume Card UI**.
When opening a project display:
last session summary
suggested next task
start session button

Fallback logic (without AI):
if unfinished session tasks exist
    suggest them
else
    suggest first active task
Goal: Users can resume work instantly.

# Phase 11 — AI System
After the core system works, implement AI features.
Create service:
services/aiService.ts
Responsibilities:
task extraction
reflection processing
summary updates
context restoration
All AI responses must return structured JSON.
Prompts are defined in:

docs/ai-system-prompts.md

Goal:
AI assists with task extraction and reflection analysis.

# Phase 12 — Context Builder
Create:

services/contextBuilder.ts

Function:

buildProjectContext(projectId)

It gathers:

project summary
active tasks
recent sessions
insights

Used by:

AI prompts
resume card

Goal:
Centralized context construction for AI.

# Phase 13 — Memory Compression
Implement project memory compression.
Tasks:
1. Add `project_memory` table.
2. Implement compression trigger:

sessions_since_last_compression >= 5
OR
total_sessions >= 20

3. Run compression prompt.
4. Update `project_memory`.
Goal:
Maintain stable AI context as projects grow.

# Phase 14 — Analytics
Implement analytics service.
Metrics:

focus minutes per day
sessions completed
focus time per project
dragon growth timeline

Goal:
Users can view progress insights.

# Phase 15 — Visual Polish
Add visual enhancements.
Includes:

dragon animations
UI microinteractions
focus timer animations
evolution effects

Follow:

docs/visual-direction.md

Goal:
The interface feels alive and delightful.

# Final Implementation Goal
Ember is complete when the user can reliably experience this loop:

Open Ember
↓
See Resume Card
↓
Start 20-minute session
↓
Reflect
↓
Dragon grows

If the system consistently supports this behavior, the core product works.
