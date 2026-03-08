For Ember, the AI must behave like a **structured project cognition system**, not a chatbot.
Below is a **clean AI Architecture section**
---AI-System-Architecture
# AI System Architecture
## Ember Cognitive Engine
The Ember AI system converts unstructured user thoughts into structured project progress.
Its primary job is to maintain **project continuity** for ADHD users who frequently lose context.
The AI must:
1. Capture user thoughts
2. Extract tasks and insights
3. Maintain project memory
4. Suggest next actions
5. Update progress after sessions
The AI system is not a general assistant.
It is a **project cognition engine**.

# 1. Core AI Responsibilities
The AI layer performs six primary functions.
### 1. Brain Dump Structuring
Convert free-form thoughts into structured project data.
Input examples:
- voice rambling
- messy notes
- fragmented ideas
AI outputs:
- tasks
- blockers
- ideas
- insights
- decisions

### 2. Task Extraction
AI identifies actionable tasks from conversation.
Example input:
> "I think the first thing I should probably do is design the homepage wireframe and maybe also think about the onboarding flow."
> 
Output:
Tasks:
- Design homepage wireframe
- Draft onboarding flow

### 3. Insight Detection
AI identifies important project-level insights.
Example:
Input:
> "The hardest part is figuring out how to handle authentication."
> 
Output:
Insight:
Key challenge: authentication architecture.

### 4. Context Restoration
When users reopen a project after days or weeks, AI summarizes:
- current project status
- unfinished tasks
- last session results
- suggested next step
Example:
“Last session you worked on the onboarding flow.
Two tasks remain unfinished.
Suggested next step: refine the signup screen wireframe.”

### 5. Reflection Processing
After a focus session, the AI processes user reflections.
Input:
User reflection:
> "Finished the homepage wireframe but realized the navigation structure needs rethinking."
> 
Output:
Completed task:
- Homepage wireframe
New task:
- Redesign navigation structure
Insight:
Navigation complexity identified.

### 6. Project Memory Management
AI continuously updates the project knowledge base.
This includes:
- tasks
- insights
- milestones
- session logs
- summaries

# 2. AI Memory Model
Each project (dragon) has its own memory structure.
### Project Memory Object
json
ProjectMemory {
  project_id
  project_name
  summary
  active_tasks[]
  backlog_tasks[]
  completed_tasks[]
  insights[]
  blockers[]
  milestones[]
  session_logs[]
  total_focus_time
}

This object evolves over time.

# 3. Session Memory
Each focus session generates a record.
### Session Object
json
Session {
  session_id
  timestamp
  focus_duration
  selected_tasks[]
  completed_tasks[]
  reflection
  ai_summary
}

These sessions feed the **project archive**.

# 4. Task Model
Tasks are stored as structured objects.
json
Task {
  task_id
  task_text
  status
  created_at
  source
  priority
  task_order
}

Status values:
- active
- backlog
- completed
Sources:
- AI extracted
- manual user entry
- reflection generated

# 5. AI Processing Pipeline
Every AI interaction follows a consistent pipeline.
### Step 1 — Input Capture
User input may be:
- voice
- text
- reflection
- conversation
Voice input is first transcribed.

### Step 2 — Context Assembly
AI receives:
- recent conversation
- project summary
- active tasks
- backlog tasks
- last session summary
This ensures context continuity.

### Step 3 — LLM Processing
The model extracts:
- tasks
- insights
- blockers
- summary updates
The system must enforce **structured JSON output**.
Example output format:
json
{
 "new_active_tasks": [],
 "new_backlog_tasks": [],
 "completed_tasks": [],
 "insights": [],
 "blockers": [],
 "summary_update": ""
}

### Step 4 — Memory Update
System updates the project memory.
Possible updates:
- add new tasks
- mark tasks complete
- update summary
- add insights

### Step 5 — UI Update
Updated information is reflected in:
- task list
- backlog
- project summary
- archives

# 6. AI Task Extraction Rules
The AI should follow clear extraction rules.
### Rule 1
Only extract **actionable tasks**.
Bad task:
“Work on the project”
Good task:
“Design homepage wireframe”

### Rule 2
Split complex tasks.
Example:
Bad:
“Design and implement login system”
Good:
- Design login flow
- Implement login backend
- Connect login UI

### Rule 3
Limit active tasks.
Maximum active tasks:
5
Overflow tasks go to backlog.

# 7. Context Window Strategy
ADHD users often return after long gaps.
The AI must prioritize relevant context.
Context priority order:
1. project summary
2. active tasks
3. unfinished tasks
4. last session summary
5. recent reflections
Older logs should be summarized periodically.

# 8. AI Prompt Structure
Each prompt should include structured sections.
Example structure:

PROJECT SUMMARY
{summary}
ACTIVE TASKS
{tasks}
BACKLOG TASKS
{backlog}
LAST SESSION
{last_session_summary}
USER INPUT
{user_message}

Instruction:
Extract tasks, insights, blockers, and summary updates.
Return structured JSON.

# 9. Voice Interaction Support
Users should be able to interact with AI through voice.
Voice pipeline:
1. Speech-to-text
2. AI processing
3. Structured output
4. UI update
Voice is critical because ADHD users often think faster than they type.

# 10. AI Reliability Safeguards
To prevent hallucinations:
AI should **never invent tasks** unrelated to user input.
Safeguards:
- tasks must map to user statements
- user can edit any AI-generated task
- manual override always allowed

# 11. AI Cost Optimization
To reduce cost:
Strategies:
- summarize old session logs
- only load relevant context
- avoid full project history in prompts
- cache project summaries

# 12. Future AI Enhancements
Potential improvements:
- project risk detection
- automatic milestone identification
- productivity coaching
- personalized focus recommendations
These should be implemented after core stability.
---