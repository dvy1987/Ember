# Ember Master Implementation Prompt
## Purpose
This document provides the **core instructions and constraints** for AI coding agents contributing to the Ember codebase.
Ember is a **local-first ADHD productivity tool** that turns projects into dragons which grow through focused work sessions.
The goal is **not task management**.
The goal is to help users **start work quickly and maintain project continuity**.

# Product Philosophy
Ember exists to solve a specific ADHD problem:
Users struggle to:
* start work
* remember where they left off
* maintain momentum
* avoid abandoning projects
Therefore Ember prioritizes:
* **low activation energy**
* **clear next steps**
* **visual progress feedback**
* **automatic context restoration**
The system must always make it easier to start a **20-minute focus session**.
If a feature does not support this goal, it should be reconsidered.

# Core Product Loop
The entire system must reinforce this loop:

Open project (dragon)
↓
Brain dump thoughts
↓
AI extracts tasks and insights
↓
User selects session tasks
↓
Start 20-minute focus session
↓
User reflects briefly
↓
AI updates project memory
↓
Dragon grows

This loop must remain simple and fast.

# Critical UX Principles
### 1. Starting must be frictionless
Users must be able to go from opening Ember to starting a focus session in **under 30 seconds**.
Never require:
* structured task lists
* detailed planning
* complex setup
before work begins.

### 2. Context restoration is essential
When reopening a project, Ember must immediately answer:

Where was I?
What should I do next?

This is implemented using the **Resume Card**.

### 3. Avoid overwhelming task lists
ADHD users generate many ideas.
To prevent overload:

Maximum active tasks = 5

Additional tasks are stored in the backlog.
Only active tasks should be visible by default.

### 4. Automation over maintenance
Users should not need to maintain the system.
AI should handle:
* task extraction
* summary updates
* insight capture
* context reconstruction
Users interact primarily through:

brain dump
focus session
reflection

# Architecture Overview
Ember is a **local-first web application**.

UI (React / Next.js)
↓
API Routes
↓
Service Layer
↓
SQLite Database
↓
AI Provider (optional)

All core functionality must work **without internet access**.
External AI APIs are optional.

# Core Backend Services
The backend is structured into services.

Project Service
Task Service
Session Service
Dragon Engine
AI Service
Analytics Service
Context Builder Service

Responsibilities:
### Project Service
* create projects
* update summaries
* manage dragon metadata
### Task Service
* manage active tasks
* manage backlog
* prevent duplicates
* reorder tasks
### Session Service
* start focus sessions
* end sessions
* attach tasks to sessions
* store reflections
### Dragon Engine
* compute dragon stage
* apply decay rules
### AI Service
* run task extraction
* process reflections
* generate summaries
* produce resume suggestions
### Context Builder Service
Builds the AI prompt context using:

project_memory
active_tasks
recent_sessions
insights

# Database Architecture
Primary tables:

projects
tasks
sessions
session_tasks
insights
milestones
settings
daily_stats
project_memory
ai_logs (optional)

SQLite is used for all data storage.
Example database location:

/data/Ember.db

# Dragon System
Each project is represented by a dragon.
Dragon stages are determined by focus time.

Egg → 0 minutes
Hatchling → 20 minutes
Adolescent → 2 hours
Adult → 14 hours
Ancient → 40 hours

Dragon decay occurs if a project is neglected.

# AI System Responsibilities
The AI layer performs structured analysis.
It must:
1. Extract tasks from brain dumps
2. Identify insights
3. process session reflections
4. maintain project summaries
5. suggest next steps
AI responses must always return **structured JSON**.
Example:
json
{
  "new_active_tasks": [],
  "new_backlog_tasks": [],
  "completed_tasks": [],
  "insights": [],
  "blockers": [],
  "summary_update": ""
}

# Memory Compression System
To prevent prompt overflow, Ember uses **project memory compression**.
Memory layers:

Working Memory
Recent Sessions
Long-Term Project Memory

Compression summarizes older sessions but **never deletes user data**.
User-owned data must always remain stored:
* tasks
* backlog
* sessions
* reflections
* insights
* milestones

# Resume Card
The Resume Card appears when opening a project.
Purpose:
Help the user immediately resume work.
Example UI:

🐉 Your dragon remembers…
Last session:
Designed homepage wireframe
Suggested next move:
Refine navigation layout
[ Start 20-minute training ]

If AI is unavailable, fallback logic should suggest:

unfinished session tasks
or
first active task

# AI Safety Rules
AI must never:
* delete tasks automatically
* invent tasks unrelated to user input
* modify user-created tasks without confirmation
Users must always retain control.

# Offline First Principle
Ember must function even when:
* AI APIs are unavailable
* internet connection is offline
Core features must always work:
* project creation
* tasks
* sessions
* dragon progression
AI enhances the system but must not gate core functionality.

# Key Product Success Criteria
Ember is successful if users experience the following moment repeatedly:

Open Ember
↓
See what they were working on
↓
Start a 20-minute session immediately

If Ember reliably creates that behavior loop, the product succeeds.
