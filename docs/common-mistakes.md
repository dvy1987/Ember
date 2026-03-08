Most ADHD productivity tools fail for **very predictable reasons**. Not because the idea is bad, but because the **product psychology is wrong**.
The following mistakes that would specifically affect **Ember**.

# 1. Over-structuring the user before they start
## Reality check
ADHD users fail at **activation**, not organization.
Most tools force this flow:

Create project
↓
Define goals
↓
Create task list
↓
Break into subtasks
↓
Prioritize
↓
Then start working

An ADHD brain sees that and thinks:
> “This is work before work.”
> 
So the user never starts.
## The real problem
Starting requires **low cognitive friction**.
## What matters vs noise
What matters:

Open project
↓
Brain dump
↓
AI extracts tasks
↓
Start timer

Everything else is secondary in the user flow.
## The smallest sharp move
In Ember:
- **Never require tasks before starting a session**
- Allow sessions with **just a brain dump**
Do not require:
- structured task lists
- milestones
- project plans
before the first session. When starting a project users should see the brain dump as the single most clear and obvious option. Allow users to start after the very first brain dump.
## What success looks like
User can go from **opening the app → starting work in <30 seconds**.

# 2. Treating ADHD users like disciplined planners
## Reality check
Many ADHD tools assume the user will:
- maintain task lists
- prioritize correctly
- review their system regularly
They won’t.
Consistency is the problem.
## The real problem
Users **lose context between sessions**.
Example:
They open the project after 5 days and think:
> “Where was I?”
> 
Then they close the app.
## What matters
The product must answer **instantly**:

Where was I?
What should I do next?

## The smallest sharp move
Your **context restoration prompt** is actually one of the most valuable things you designed.
When opening a dragon:

Last session:
Homepage wireframe completed
Next step:
Refine navigation layout

That single message removes the biggest friction.
## What I would kill
Avoid dashboards full of metrics when opening the project.
The first thing shown should be **next action**.
## Success signal
Users reopen a project after a week and immediately start a session.

# 3. Gamification that feels fake
## Reality check
Most gamified productivity tools fail because the rewards feel **detached from the work**. ADHD users stop caring quickly.
## The real problem
Rewards must be **directly tied to effort**.
## What matters
Your dragon system works because:

focus time → dragon growth

The progress is **literally embodied by the project**.
That’s good design.
## What I would avoid
Don’t add:
- random currencies
- loot boxes
- arbitrary XP systems
unless they relate to projects.
## The smallest sharp move
Keep the feedback simple:

You trained your dragon for 40 minutes.

Even the productivity points earn go towards unlocking another dragon egg and adding a new project. And ADHD folks love starting new projects.
## Success signal
Users feel **attached to their projects**, not to the points.

# 4. Letting task lists explode
## Reality check
ADHD users are idea generators.
Give them a brain dump tool and you’ll get:

73 tasks

Then the system becomes overwhelming.
This kills the product.
## The real problem
Decision fatigue.
If a user opens a project and sees **15 options**, they start none.
## What matters
You already proposed the right constraint:

max active tasks = 5

Everything else goes to backlog.
## The smallest sharp move
When opening a project, show only:

Active tasks (≤5)
Bring clear attention to the resume card

Backlog is hidden unless clicked at and expanded by the user.
## What I would kill
Don’t show:
- full backlog
- large task trees
by default.
## Success signal
User can choose a task in **<5 seconds**.

# 5. Making the tool itself feel like work
## Reality check
The worst ADHD tools require constant maintenance.
Example:

update tasks
organize projects
review goals
archive tasks
tag everything

Eventually the user thinks:
> “Maintaining the system is harder than the work.”
> 
And quits.
## The real problem
Tools should **reduce cognitive load**, not add to it.
## What matters
Automation.
Your AI layer is supposed to do:

extract tasks
update summary
capture insights

That’s good.
## The smallest sharp move
Users should never feel forced to:
- clean task lists
- remove and/or combine duplicates
- rewrite summaries
- reorganize projects
AI should handle most of that.
## What I would delay
Complex tagging systems.
## Success signal
User mostly interacts through:

brain dump
focus session
reflection

Everything else happens automatically.

# What matters vs what doesn’t (for Ember)
### What actually determines success
1. **Starting friction**
2. **Context restoration**
3. **Clear next task**
4. **Emotional progress feedback**

# The smallest sharp principle for Ember
If you remember one rule while building:
> **Every screen should make starting the next 20-minute session easier.**
> 
If something doesn’t serve that, it’s probably noise.

# What success would look like in hindsight
A week or a month later you open Ember and feel:

Oh right, I was working on this. I know exactly what to do next
Let’s do 20 minutes.

And you actually start.
If the tool reliably creates **that moment**, the product works.