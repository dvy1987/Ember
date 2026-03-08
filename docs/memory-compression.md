Without **Project Memory Compression**, the AI layer will slowly break because:
- session history grows
- prompts exceed context limits
- responses become inconsistent
- costs increase
So Ember needs a **multi-layer memory model**.
Think of it like **human memory**:
1. Working memory (current tasks)
2. Short-term memory (recent sessions)
3. Long-term memory (compressed project understanding)

# Ember Project Memory Compression System
## Goal
Maintain a stable project understanding without sending the entire history to the LLM.
Instead of loading **everything**, the AI receives:

Project Summary
+
Active Tasks
+
Key Insights
+
Last Session Summary
+
User Input

Everything else gets **compressed periodically**.

# Memory Compression Safety Rules
## Purpose
Memory compression in Ember is designed to **optimize AI context**, not to remove or destroy user data.
Compression ensures that AI prompts remain concise and effective as a project grows, while preserving the full project history in the database.
At no point should compression result in the loss of user-created information.

## Core Principle
**Memory compression affects AI context, not stored project data.**
All user data must remain permanently stored unless explicitly deleted by the user.
This includes:
- tasks
- backlog tasks
- completed tasks
- session logs
- reflections
- insights
- milestones
Compression is only used to reduce the amount of information sent to the AI model.

## What Compression Does
Compression may update or generate the following:
- project summary
- long-term project memory
- milestone extraction
- insight extraction
- high-level summaries of older sessions
These summaries help the AI understand the project without requiring the full session history.

## What Compression Must Never Do
Memory compression must **never automatically delete or modify user-owned artifacts**.
The following must always remain intact in the database:
- active tasks
- backlog tasks
- completed tasks
- session records
- reflections
- insights
- milestones
Even if older sessions are summarized for AI context, the original records must remain available for viewing and analytics.

## Session History Handling
Older sessions may be summarized to produce long-term project memory, but the original session records must remain stored.
Example approach:
- recent sessions are used directly in AI context
- older sessions are summarized into long-term memory
- original session records remain stored in the database
This preserves the full project timeline while maintaining efficient AI prompts.

## Rationale
Users with ADHD rely heavily on external systems to store ideas, progress, and context.
If Ember appears to lose or modify stored information automatically, it may break user trust and discourage continued use.
Therefore:
**All compression mechanisms must preserve the full integrity of user data.**

If you'd like, I can also help you add **one small but very useful addition to your schema** that will make memory compression much cleaner to implement (and easier for Warp agents to generate correctly).

# Memory Layers for memory compression
## 1. Working Memory (Immediate Context)
This is the information always sent to the AI.
Contents:

project_summary
active_tasks
top_backlog_tasks
last_session_summary
recent_insights
user_input

This should stay **under ~1,000 tokens**.

## 2. Recent Session Memory
Recent sessions still matter for context.
Recommended:
Store last **3–5 sessions**.
Example:

recent_sessions = [
 session_1_summary,
 session_2_summary,
 session_3_summary
]

Older sessions are compressed.

## 3. Long-Term Project Memory
This stores the **condensed understanding** of the project.
Example:

long_term_summary
key_decisions
major_milestones
persistent_blockers

This replaces hundreds of old session logs.

# Compression Trigger
Compression should run when either condition occurs:

sessions_since_last_compression >= 5
OR
total_session_logs >= 20

This prevents memory explosion.

# Compression Pipeline
Step-by-step system.
### Step 1 — Select Old Sessions
Choose sessions older than the last 5.
Example:

sessions_to_compress = sessions[0:15]

### Step 2 — Send to Compression Prompt
LLM receives summarized logs.
Prompt:
You are compressing historical project activity into long-term project memory.
Your job is to extract durable project knowledge.
INPUT
PROJECT SUMMARY
{project_summary}
OLD SESSION SUMMARIES
{session_logs}
RECENT INSIGHTS
{insights}
RULES
1. Extract major milestones.
2. Identify important decisions.
3. Identify persistent challenges.
4. Remove redundant details.
5. Keep the output concise.
OUTPUT JSON
{
"long_term_summary": "",
"milestones": [],
"decisions": [],
"persistent_blockers": []
}

### Step 3 — Update Long-Term Memory
Database updates:
- project_summary
- milestones
- insights
- blockers

### Step 4 — Summarize Old Logs
Compressed sessions can be removed or archived.
Example:

Older sessions may be summarized for AI context,
but the original session records must remain stored
in the database for history and analytics.

Or move them to a separate archive table.

# Updated Memory Structure
Each project ends up with a stable memory model:

Project
 ├── Summary
 ├── Active Tasks
 ├── Backlog Tasks
 ├── Insights
 ├── Milestones
 ├── Last Session
 ├── Recent Sessions (3–5)
 └── Long-Term Memory

This keeps context **compact but intelligent**.

# Example Context Sent to AI
When user opens a dragon:

PROJECT SUMMARY
User is designing onboarding flow and homepage.
ACTIVE TASKS
- Design navigation layout
- Implement signup API
- Test onboarding screens
LAST SESSION
Homepage wireframe completed.
INSIGHTS
Navigation complexity discovered.
USER INPUT
"I think I should now test the login flow."

That’s enough for good reasoning.

# Why This Matters
Without compression:
After **30 sessions**, prompts look like this:

Session 1
Session 2
Session 3
Session 4
Session 5
...
Session 30

The AI becomes confused.
With compression:

Project summary
Recent activity
Key insights

Clean and stable.

# Optional Improvement (Very Powerful)
Add a **Project Knowledge Graph**.
Example structure:

entities:
- homepage
- authentication
- onboarding
relationships:
- onboarding requires authentication

This improves AI reasoning.
But it’s **not required for v1**.

# One Product Insight
ADHD users don’t forget tasks.
They forget **context**.
When Ember can instantly show:
> “Last time you trained this dragon you redesigned navigation and discovered onboarding complexity.”
> 
the product becomes **dramatically more usable**.
That’s the real value of the memory system.
A small schema addition that will make **memory compression much cleaner** is a **Session Memory Layer**.
Right now your schema stores:
- sessions
- insights
- milestones
- project summary
But compression needs a place to store **compressed knowledge** separately from raw session logs.
If you don’t add this, agents will start mutating the `projects.project_summary` field too aggressively and you’ll lose structure.
The clean solution is to add **a project memory table**. This is in addition to the schema described in backend-architecture.md
project_summary represents the current short description of the project,
while project_memory.long_term_summary stores compressed historical understanding.

# Project Memory Layer (Schema Addition)
## Purpose
The project memory layer stores **long-term compressed knowledge about a project**.
It acts as the stable memory used by the AI when constructing context for prompts.
This prevents the system from repeatedly scanning the entire session history.

# New Table: `project_memory`
sql
project_memory
-----------id (primary key)
project_id (foreign key)
long_term_summary
key_decisions
persistent_blockers
memory_version
last_updated

# Field Definitions
### long_term_summary
A compressed description of the project’s overall state.
Example:

User is building onboarding and authentication flows.
Homepage and navigation structure are completed.
Current focus is implementing the login API.

This becomes the **primary memory used by AI prompts**.

### key_decisions
Important architectural or design decisions discovered during sessions.
Example:

Authentication will use OAuth instead of password login.
Navigation will use a sidebar layout.

These decisions are **durable knowledge** that should persist across sessions.

### persistent_blockers
Problems that repeatedly slow progress.
Example:

Authentication library compatibility issues.
Unclear onboarding flow for new users.

This allows the AI to recognize **recurring friction points**.

### memory_version
Integer used to track how many times compression has updated the memory.
Example:

memory_version = 4

Useful for debugging and AI log tracking.

### last_updated
Timestamp of last memory compression.

# Updated Memory Model
After adding this table, the system has **three memory layers**.
## Raw History
Stored in:

sessions
insights
tasks

This is the full project record.

## Compressed Memory
Stored in:

project_memory

This is the **AI's long-term understanding**.

## Working Context
Constructed dynamically when calling the AI:

project_memory.long_term_summary
+
active_tasks
+
recent_sessions
+
insights
+
user_input

This becomes the **prompt context**.

# Updated Compression Flow
Step 1
Select sessions older than the most recent 5.

Step 2
Send those sessions to the compression prompt.

Step 3
Update `project_memory`.
Example:
sql
UPDATE project_memory
SET
 long_term_summary = "...",
 key_decisions = "...",
 persistent_blockers = "...",
 memory_version = memory_version + 1,
 last_updated = NOW()
WHERE project_id = ?

Step 4
Do **nothing to raw session logs**.
They remain intact.

# Why This Table Matters
Without this table:
The system mixes **short-term and long-term memory** inside `projects.project_summary`.
That leads to:
- unstable summaries
- lost context
- inconsistent prompts
With `project_memory`, the system gains:
- stable AI context
- easier prompt construction
- safer compression
- clearer architecture

# Updated Backend Schema Overview
Final schema should now include:

projects
tasks
sessions
session_tasks
insights
milestones
settings
daily_stats
project_memory
ai_logs 

Still very lightweight.

# One Final Architecture Tip
Add a **Context Builder service**.

services/contextBuilder.ts

Its only job:
tsx
buildProjectContext(projectId)

It gathers:
- project_memory
- active_tasks
- recent_sessions
- insights
and formats the prompt context.
Without this layer, AI logic tends to spread everywhere in the codebase.

If you'd like, I can also show you **one design tweak to the task system** that will make the AI dramatically better at helping ADHD users pick what to work on next (and it only requires adding one small field to the tasks table).