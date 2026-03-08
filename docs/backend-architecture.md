# Backend Architecture

Below is a **clean draft** of the **Backend Architecture and Database Schema** for Ember, adjusted for:

- local web app
- SQLite
- optional external LLM APIs
- AI-driven task extraction
- session-task relationships
- dragon progression + decay
- open-source friendliness

This version removes desktop assumptions and structures the backend so agents or contributors can extend it safely.

## Ember Local Backend

Ember runs as a **local-first web application** using a lightweight backend layer that manages project logic, database access, and AI interactions.

The backend is responsible for:

- project and dragon state management
- task and backlog management
- focus session tracking
- AI processing and task extraction
- data persistence
- analytics generation

All application data is stored locally in **SQLite**.

The backend runs inside the same environment as the web app using **Next.js API routes or a Node runtime**.

---

# Backend Layer Structure

The backend follows a **service-oriented architecture**.

```
UI (React / Next.js)
        ↓
API Routes
        ↓
Service Layer
   ├── Project Service
   ├── Task Service
   ├── Session Service
   ├── Dragon Engine
   ├── AI Service
   ├── Analytics Service
   └──Context Builder Service         ↓
Database Layer (SQLite)
        ↓
AI Provider
   ├── Local LLM (optional)
   └── External API (OpenAI / OpenRouter / Anthropic)
```

Context builder is to be built later in the bulid plan. This service would buildProjectContext(projectId)

and gather:
- project_memory
- active_tasks
- recent_sessions
- insights

The resume card and AI prompts both depend on this.

---

# API Layer

The API layer exposes endpoints used by the UI.

Responsibilities:

- input validation
- calling appropriate service
- returning structured JSON

Example API categories:

### Project APIs

```
POST   /api/projects/create
GET    /api/projects
GET    /api/projects/{id}
PATCH  /api/projects/{id}
DELETE /api/projects/{id}
```

### Task APIs

```
POST   /api/tasks/create
PATCH  /api/tasks/{id}
DELETE /api/tasks/{id}
POST   /api/tasks/reorder
```

### Session APIs

```
POST   /api/sessions/start
POST   /api/sessions/end
GET    /api/sessions/project/{project_id}
```

### AI APIs

```
POST /api/ai/extract-tasks
POST /api/ai/process-reflection
POST /api/ai/summarize-project
```

---

# Service Layer

The service layer contains all business logic.

## Project Service

Responsibilities:

- create projects
- manage dragon type
- update project summaries
- archive completed projects

---

## Task Service

Responsibilities:

- manage active and backlog tasks
- reorder tasks
- mark tasks complete
- move tasks between active and backlog

---

## Session Service

Responsibilities:

- start focus sessions
- end sessions
- attach tasks to sessions
- store reflections
- update project focus time

---

## Dragon Engine

Responsible for dragon lifecycle logic.

Functions:

- compute dragon stage
- apply decay rules
- update dragon state
- trigger dragon evolution

Dragon state depends on:

- total focus time
- last session timestamp
- inactivity duration

---

## AI Service

Handles all AI interactions.

Responsibilities:

- build prompt context
- call LLM provider
- validate structured JSON response
- extract tasks
- extract insights
- update project summaries

Supports:

- local models
- external API providers

---

## Analytics Service

Generates usage statistics:

- focus time per day
- project progress
- session history
- dragon growth metrics

---

# Database Layer

All application data is stored in **SQLite**.

The database is embedded and stored as a local file.

Example location:

```
/data/Ember.db
```

The database schema is optimized for:

- project tracking
- task management
- focus sessions
- AI-generated insights
- analytics

---

# Database Schema

## Projects Table

Stores all project and dragon information.

```
projects
---------
id (primary key)
name
dragon_type
dragon_stage
total_focus_minutes
project_summary
created_at
updated_at
last_session_at
last_decay_check
is_archived
```

project_summary represents the current short description of the project,

---

## Tasks Table

Stores all project tasks.

```
tasks
---------
id (primary key)
project_id (foreign key)
task_text
status
priority
task_order
source
created_at
completed_at
```

Status values:

- active
- backlog
- completed

Source values:

- ai
- user
- reflection

---

## Sessions Table

Stores focus session information.

```
sessions
---------
id (primary key)
project_id (foreign key)
start_time
end_time
duration_minutes
reflection
ai_summary
tasks_completed_count
created_at
```

---

## Session Tasks Table

Maps tasks worked on during each session.

```
session_tasks
--------------
id (primary key)
session_id (foreign key)
task_id (foreign key)
status
```

Status values:

- worked_on
- completed

---

## Insights Table

Stores AI-extracted project insights.

```
insights
---------
id (primary key)
project_id (foreign key)
insight_text
source
created_at
```

Source values:

- ai
- user

---

## Milestones Table

Tracks major project milestones.

```
milestones
----------
id (primary key)
project_id (foreign key)
milestone_text
achieved_at
```

---

## Settings Table

Stores user configuration.

```
settings
---------
key (primary key)
value
updated_at
```

Example keys:

- openai_api_key
- openrouter_api_key
- default_focus_time
- voice_enabled

---

## Daily Stats Table

Stores analytics data for dashboards.

```
daily_stats
------------
date (primary key)
focus_minutes
sessions_completed
```

---

## AI Logs Table

Stores AI interactions for debugging.

```
ai_logs
--------
id (primary key)
project_id
action_type
input_text
output_json
created_at
```

Action types include:

- task_extraction
- reflection_processing
- project_summary_update

This table may be disabled in production builds.

---

## Project Memory

A table named project_memory will need to be created.

project_memory is optional for MVP and may be added after initial release. See memory-compression.md for details. 


# Dragon State Logic

Dragon stage is computed using total focus time.

Example thresholds:

```
0 minutes → egg
20 minutes → hatchling
120 minutes → adolescent dragon
840 minutes → adult dragon
2400 minutes → ancient dragon
```

Dragon decay is computed using:

```
last_session_at
last_decay_check
```

If inactivity exceeds defined thresholds, dragon stage may regress.

---

# Data Export

Users should be able to export their data.

Supported export formats:

- JSON
- SQLite backup

Export allows:

- backups
- migration
- open-source experimentation

---

# Privacy Model

Ember is local-first.

Default behavior:

- no user accounts
- no telemetry
- no data leaves the device

External AI APIs are only used if the user provides an API key.

---

# Final Architectural Principle

Ember prioritizes:

**local reliability, data ownership, and fast interaction loops.**

All essential productivity functionality must continue working even when:

- AI is unavailable
- internet connection is offline
- external APIs fail.

---