# Ember Architecture Guard Prompt
## Purpose
This prompt defines the **non-negotiable architectural rules** for Ember.
Any AI coding agent contributing to this repository must follow these constraints when generating code.
The goal is to keep Ember:
* simple
* local-first
* maintainable
* aligned with the ADHD product philosophy
If an implementation violates these rules, it should be rejected or revised.

# Core Principle
Ember is a **local-first ADHD productivity tool**.
The system must remain:
* simple to run locally
* easy to understand
* easy to modify by open-source contributors
Complex infrastructure is not allowed unless absolutely necessary.

# Technology Stack Constraints
Ember must remain within this stack.
### Frontend
text
Next.js
React
TypeScript

### Backend
text
Next.js API routes
Node runtime

### Database
text
SQLite

Database file example:
text
/data/Ember.db

# Prohibited Infrastructure
Agents must **not introduce**:
text
PostgreSQL
MongoDB
Firebase
Supabase
Redis
Docker orchestration
Microservices
Kubernetes
Cloud-only infrastructure

Ember is intentionally **not a SaaS platform**.

# Local-First Requirement
All core functionality must work **without internet access**.
The following features must always work offline:
* project creation
* task management
* focus sessions
* dragon progression
* viewing project history
AI is an **enhancement**, not a dependency.
If AI APIs are unavailable, Ember must still function.

# AI Integration Rules
AI must be implemented as a **service layer**, not embedded directly in UI components.
All AI interactions must go through: AIService

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

Agents must never assume free-form AI responses.

# Service Layer Requirement
Business logic must be implemented in services.
Approved service structure:
services/
  projectService.ts
  taskService.ts
  sessionService.ts
  dragonEngine.ts
  aiService.ts
  analyticsService.ts
  contextBuilder.ts
UI components must **never contain business logic**.
Different prompts return different schemas.
AIService must normalize responses before updating the database.
# Database Rules
All persistent data must be stored in SQLite.
Primary tables:
text
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

Agents must not introduce new databases.

# Task System Rules
The system must enforce:
text
Maximum active tasks per project = 5

Additional tasks must be placed in the backlog.
The UI must prioritize showing **active tasks only**.

# Memory Compression Rules
Memory compression exists to **optimize AI prompts**, not to delete user data.
Compression must never delete:
* tasks
* backlog tasks
* sessions
* reflections
* insights
* milestones
All user data must remain permanently stored.

# Resume Card Priority
The Resume Card is a **critical UX feature**.
When opening a project, the user should immediately see:
text
Last session
Suggested next step
Start session button

Agents must not replace this with dashboards or analytics.

# Simplicity Rule
When generating code, agents should prefer:
* simple functions
* readable logic
* minimal dependencies
Avoid introducing heavy frameworks unless they solve a clear problem.

# Dependency Policy
New dependencies should be added only if they provide clear value.
Avoid:
* large UI frameworks
* complex state management systems
* unnecessary backend libraries
Preferred solutions are **small and focused**.

# Code Style Expectations
Code should prioritize:
* clarity
* modular services
* predictable data flow
Avoid deeply nested abstractions.
Prefer explicit logic.

# Feature Evaluation Rule
Before implementing a new feature, agents should ask:
text
Does this make it easier to start a 20-minute focus session?

If the answer is no, the feature likely does not belong in the core system.

# Failure Conditions
Generated implementations should be rejected if they:
* introduce cloud-only dependencies
* break offline functionality
* bypass the service layer
* delete user data automatically
* significantly increase system complexity

# Guiding Product Principle
Ember succeeds if it consistently creates this moment for users:
text
Open Ember
↓
Understand what they were working on
↓
Start a 20-minute focus session immediately

All architecture decisions should support this behavior loop.
