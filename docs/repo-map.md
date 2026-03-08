# Ember Repository Map
This document helps AI agents and contributors quickly understand the structure of the Ember codebase.
Ember is a **local-first ADHD productivity tool** where projects are represented as dragons that grow through focused work sessions.
The system prioritizes:
- low activation friction
- project continuity
- emotional engagement
- visual progress

# High-Level Architecture

UI (React / Next.js)
↓
API Routes
↓
Service Layer
↓
SQLite Database
↓
AI Provider (optional)

All essential functionality must work **offline**.
AI enhances the system but if needed app can be run offline.

# Repository Structure
/
├── app/                # Next.js application routes
├── components/         # UI components
├── services/           # Business logic services
├── lib/                # shared utilities
├── db/                 # database setup and migrations
├── assets/             # dragons, icons, UI assets
│
├── data/               # local SQLite database file
│   └── Ember.db
│
└── docs/               # product and architecture documentation

# Key Directories
## app/
Next.js routes and pages.
Examples:
/app
/page.tsx
/project/[id]
/session
These pages should contain **minimal logic** and call services for data.
## components/
Reusable UI components.
Examples:
DragonCard
ResumeCard
FocusTimer
TaskList
BrainDumpInput
Components should focus on presentation and user interaction.
Business logic should not live here.

## services/
Core application logic lives here.
Expected services:
projectService.ts
taskService.ts
sessionService.ts
dragonEngine.ts
aiService.ts
analyticsService.ts
contextBuilder.ts
Responsibilities:
- enforce business rules
- interact with database
- coordinate AI processing
## db/
Database configuration and migrations.
Files may include:
db.ts
schema.ts
migrations/

The database used is **SQLite**.
Location:
/data/Ember.db
## assets/
Static assets used in the UI.
Structure:
assets/
    dragons/
        cinder/
        moss/
        drift/
    icons/

Dragon images correspond to dragon stages:
egg
hatchling
adolescent
adult
ancient
## docs/
Contains all documentation for:
- product design
- architecture
- AI behavior
- development guidelines
Important documents:
PRD.md
master-prompt.md
architecture-guard.md
backend-architecture.md
ai-system-architecture.md
memory-compression.md
resume-card.md
visual-direction.md
common-mistakes.md
agents.md
build-plan.md

AI agents must read these documents before generating code.
# Core System Loop
The system revolves around the productivity loop:
Open project
↓
Brain dump thoughts
↓
AI extracts tasks
↓
Start focus session
↓
Reflect
↓
Dragon progresses to the next stage after the required amount of focus time
Every feature should support this loop.

# Critical UX Element
The **Resume Card** is the most important UI component.
When opening a project, the user should immediately see:
Last session
Suggested next step
Start session button
This reduces activation friction.
# Design Philosophy
Ember blends:
- a calm but alive and delightful productivity workspace
- a playful creature world
- working and focusing is taking care of your dragon pets
Dragons represent projects.
Progress strengthens the dragon.
Neglect weakens it.
The UI should feel **alive but not loud**.
# Development Rule
When implementing new features, always ask:
Does this make it easier to start a 20-minute focus session?

If not, reconsider the feature.