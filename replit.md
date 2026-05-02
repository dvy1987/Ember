# Ember — Train Your Dragons

An ADHD productivity app where projects are dragons that grow through focused work sessions. Built as a Vite + React frontend with an Express backend, migrated from a Next.js/Vercel project.

## Architecture

### Monorepo Structure
- `artifacts/ember/` — React + Vite frontend (port 22809, previewPath `/`)
- `artifacts/api-server/` — Express backend (port 8080, proxied via `/api`)
- `artifacts/mockup-sandbox/` — Canvas/design preview server

### Frontend (`artifacts/ember/`)
- **Framework**: React 19 + Vite + TypeScript
- **Routing**: Wouter (replacing Next.js router)
- **Styling**: Tailwind CSS v4 with custom ember theme variables
- **Key Pages**:
  - `HomePage` — Dragon Roost grid of all projects
  - `ProjectPage` — Project view with resume card, brain dump, task management
  - `SessionPage` — 4-phase focus session (select tasks → timer → reflect → complete)
  - `AnalyticsPage` — Weekly stats, per-project focus breakdown
- **Key Components**:
  - `DragonCard` — Project card with dragon image, stage, focus time
  - `CreateProjectModal` — Hatch a new dragon with name + type selection
  - `ResumeCard` — Contextual resume suggestion with last session info
  - `TaskList` — Active (max 5) + backlog task management
  - `BrainDumpInput` — Free-text input sent to AI for task extraction
  - `FocusTimer` — Circular SVG countdown timer with pause/add-time

### Backend (`artifacts/api-server/`)
- **Framework**: Express 5 + TypeScript
- **Database**: SQLite via `better-sqlite3` v12.9.0 (stored at `data/ember.db`)
- **Services**:
  - `projectService` — CRUD for projects
  - `taskService` — CRUD for tasks (max 5 active, overflow → backlog)
  - `sessionService` — Start/end focus sessions, track duration
  - `analyticsService` — Weekly stats, per-project breakdown, streaks
  - `dragonEngine` — Compute dragon stage from focus minutes + neglect decay
  - `contextBuilder` — Build structured context for AI prompts, resume suggestions
  - `aiService` — OpenAI/OpenRouter integration (optional, falls back gracefully)
- **API Routes** (all under `/api`):
  - `GET/POST /api/projects` — List all / create project
  - `GET/PATCH/DELETE /api/projects/:id` — Single project operations
  - `GET/POST /api/tasks` — List by project+status / create task
  - `PATCH/DELETE /api/tasks/:id` — Update (complete/move/edit) / delete task
  - `POST /api/sessions/start` — Start a focus session
  - `POST /api/sessions/end` — End session, record reflection, update dragon
  - `GET /api/sessions/project/:projectId` — Session history
  - `GET /api/analytics` — Weekly stats + project breakdown + overall stats
  - `GET /api/resume?project_id=` — AI or fallback resume context
  - `POST /api/ai/extract-tasks` — Brain dump → task extraction via LLM
  - `POST /api/ai/process-reflection` — Session reflection → AI processing
  - `POST /api/ai/summarize-project` — Generate/update project summary
  - `GET /api/healthz` — Health check

## Dragon System

### Types
- **Cinder** 🔥 — Orange theme (`#ff6b35`)
- **Moss** 🌿 — Green theme (`#4a9e6e`)
- **Drift** 💨 — Blue theme (`#5b9bd5`)

### Stages (by total focus minutes)
| Stage | Min Minutes |
|-------|------------|
| Egg | 0 |
| Hatchling | 20 |
| Adolescent | 120 |
| Adult | 840 |
| Ancient | 2400 |

### Neglect Decay
- 1+ day → Sleepy
- 3+ days → Restless
- 7+ days → stage drops by 1
- 20+ days → stage drops by 2
- 180+ days → back to egg

## AI Integration (Optional)
AI works without API keys — all features degrade gracefully. Configure via:
1. `settings` table keys: `openai_api_key` or `openrouter_api_key`
2. Environment variables: `OPENAI_API_KEY` or `OPENROUTER_API_KEY`

AI features: task extraction from brain dumps, reflection processing, project summarization, resume suggestions, memory compression after 6+ sessions.

## Dragon Assets
Images live at `artifacts/ember/public/dragons/<type>/<stage>-<type>.webp`.

Known typo: Drift adolescent image is `adolscent-drift.webp` (missing 'e') — handled in `dragonAssets.ts`.

Available images: cinder (all 5 stages), drift (all 5 stages), moss (hatchling + adolescent only).

## Key Decisions
- SQLite chosen over PostgreSQL for simplicity (single-file local DB)
- `better-sqlite3` v12.9.0 used (prebuilt binary for Node 24/ABI v137 via `prebuild-install`)
- Vite dev server proxies `/api/*` to Express on port 8080
- `BASE_URL` env var injected by Vite for correct asset paths
- Max 5 active tasks per project — extras go to backlog automatically
