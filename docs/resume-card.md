For ADHD tools the real target is **“easy to re-enter after avoidance.”** If the app helps you restart after you’ve been away for days, it becomes something you actually use.
The single feature that does this best is **Instant Resume**.

# The Feature: Instant Resume
When you open a project (dragon), the app **immediately reconstructs the next step** without you thinking.
Instead of showing a dashboard or task list first, the screen says something like:

Last training session:
✔ Designed homepage wireframe
Your dragon suggests the next move:
Refine the navigation layout
Ready for a 20-minute session?
[Start Training]

One click → timer starts.
No browsing. No planning.

# Why This Works for ADHD
ADHD users don’t abandon tools because they hate them.
They abandon them because of **activation energy**.
The moment usually looks like this:
1. Open project
2. See many tasks
3. Brain freezes
4. Close the app
Instant Resume removes that decision step.
The brain sees:

Oh right, that's what I was doing.

and starts.

# What Actually Happens Under the Hood
You already designed most of the pieces.
The system simply composes them.
Input data:

project_summary
active_tasks
last_session_summary
recent_insights

AI generates:

status_summary
suggested_next_step

Then the UI renders a **Resume Card**.

# Resume Card UI
Simple structure:

🐉 Your dragon remembers…
Last session:
Designed homepage wireframe
Suggested next move:
Refine navigation layout
[ Start 20-minute training ]

Optional small button:

Choose a different task

# Implementation (Very Simple)
Add a service:

contextBuilder.buildResumeContext(projectId)

It gathers:

project_memory
active_tasks
last_session
insights

Then calls your **context restoration prompt**.
The response fills the Resume Card.

# Even Simpler Version (No AI Required)
If AI fails or API key missing:
Fallback logic:

if unfinished session_tasks exist
    recommend them
else
    recommend first active task

So the feature **always works**.

# Where It Appears
Two places:
### 1. When opening a dragon
Primary entry point.
### 2. Home screen
Example:

Your dragons need training:
🔥 Onboarding Dragon
Last trained: 3 days ago
Next step: Refine signup screen

Click → start session.

# Why This Beats Most Productivity Tools
Most tools open with:
- dashboards
- lists
- analytics
- calendars
All of which require **thinking**.
Ember should open with:

Here’s the next step.
Start now.

That’s fundamentally different.

# The Behavioral Loop It Creates

Open Ember
↓
Dragon reminds you what to do
↓
Start 20-minute session
↓
Dragon grows
↓
Close app
↓
Return days later
↓
Instant Resume works again

That loop is what makes the tool **stick**.

# What Success Looks Like
You open the app after 5 days and feel:

Oh right.
Let me do 20 minutes.

No planning.
No organizing.
Just starting.
If Ember consistently produces that moment, it becomes a daily tool instead of another abandoned productivity experiment.