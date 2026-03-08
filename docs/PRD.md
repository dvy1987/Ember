# Product Requirements Document
## Product: **Ember**
A dragon-training productivity world for ADHD users.

# 1. Product Vision
Ember is a **single-player productivity world** where projects are represented as dragons that must be trained through focused work sessions.
Users with ADHD often struggle with:
- starting projects
- maintaining momentum
- remembering context
- prioritizing tasks
- finishing work
Ember transforms work into **dragon training**.
Projects evolve visually as the user invests focus time, while neglect causes dragons to weaken and regress.
The goal is to create an **emotionally engaging productivity loop** that reinforces consistency and project completion.

# 2. Target User
Primary user:
Adults with ADHD who struggle with:
- unfinished projects
- idea overload
- losing momentum
- task paralysis
- inconsistent work habits
These users typically:
- start many things
- abandon them midway
- forget context between sessions
- dislike rigid productivity tools
They benefit from:
- emotional engagement
- visual progress
- AI assistance with structuring thoughts

# 3. Core Product Loop
The entire product must reinforce this loop:
1. Choose a dragon (project)
2. Brain dump current thoughts
3. AI extracts tasks and insights
4. Select session tasks
5. Start focus timer
6. Complete session
7. Reflect briefly
8. Dragon grows
Neglect weakens the dragon.
Consistency strengthens it.

# 4. Key Concepts
## Dragon = Project
Each project is represented as a dragon.
Stages:
1. Egg
2. Hatchling
3. Adolescent Dragon
4. Adult Dragon
5. Ancient Dragon
Dragon evolution represents accumulated focus effort.

## Dragon Eggs (Project Limits)
Users begin with:
**3 active dragon eggs**
Additional eggs can be unlocked by completing projects.
Unlocking new eggs may require:
- completed dragons
- earned karma
- player choice
Maximum expansion is flexible (e.g., 5–7 projects).

# 5. Dragon Growth System
Growth is determined by **total focus time invested in the project.**
| Stage | Required Focus Time |
| --- | --- |
| Egg → Hatchling | 20 minutes |
| Hatchling → Adolescent | 2 hours |
| Adolescent → Adult | 14 hours |
| Adult → Ancient | 40 hours |
Ancient dragons represent completed or deeply developed projects.

# 6. Momentum Decay (Dragon Neglect)
If a project is ignored, the dragon weakens.
This introduces emotional accountability.
### Decay Stages
| Time Without Training | Effect |
| --- | --- |
| 24 hours | Dragon becomes **sleepy** |
| 3 days | Dragon becomes **restless** |
| 7 days | Dragon **loses one stage** |
| 20 days | Dragon **loses another stage** |
| 6 months | Dragon reverts to **egg** |
Example:
Adult Dragon ignored for 7 days → becomes Adolescent Dragon.
Ancient Dragon ignored for 20 days → becomes Adolescent Dragon.
Progress loss introduces meaningful pressure.

# 7. Creating a Project
User creates a dragon egg by:
1. Naming the project
2. Selecting dragon type
3. Brain dumping the project idea
Input formats:
- text
- voice

# 8. AI Project Initialization
After brain dump, AI extracts:
- project summary
- potential goals
- task suggestions
- key challenges
- early milestones
Outputs:
- active task list
- backlog tasks
- project insights

# 9. Task System
Two types of tasks:
### Active Tasks
Visible during focus sessions.
Maximum: **5 tasks**

### Backlog Tasks
Overflow tasks extracted by AI.
Unlimited.
User can move backlog tasks into active tasks.

# 10. Task Creation Sources
Tasks may come from:
- AI extraction
- manual entry
- post-session reflections
- previous session leftovers
Unfinished tasks remain active for future sessions.

# 11. Session Preparation
Before starting a focus session, user can:
1. Brain dump current thoughts
2. Ask AI for guidance
3. Add tasks
4. Select tasks to focus on
AI analyzes the conversation to extract:
- tasks
- blockers
- insights
- priorities

# 12. Focus Sessions
Default focus time:
**20 minutes**
User options:
- extend timer
- shorten timer
- add time (+5, +10, +20 minutes)
User selects which tasks to work on during the session.

# 13. Post Session Reflection
Instead of “What happened?”, use structured prompts.
Example prompts:
- What did you accomplish?
- Did you hit any blockers?
- What should happen next?
User can:
- speak
- type
- skip
AI processes the reflection and updates:
- completed tasks
- new tasks
- project insights
- project summary

# 14. Project Archives
Each dragon maintains a **chronological project history.**
Includes:
- session logs
- reflections
- completed tasks
- milestones
- AI summaries
Users can revisit past sessions to restore context.
This solves the ADHD problem of **forgetting where you left off.**

# 15. Dragon Types (Ecosystems)
Different dragon species can represent different working styles.
Examples:
Fire Dragon — intense bursts of focus
Forest Dragon — slow and steady growth
Storm Dragon — chaotic but powerful progress
Dragon types affect:
- visual appearance
- animation
- environment
This is primarily cosmetic but increases emotional engagement.

# 16. Game World (Lightweight)
Ember includes a simple world where dragons live.
Possible areas:
- hatchery
- training grounds
- archives
- dragon roost
The world is primarily visual storytelling rather than gameplay complexity.

# 17. Progress Analytics
Users can view insights such as:
- total focus time
- sessions completed
- focus time per project
- weekly activity
- dragon growth progress
Goal: reinforce **visible effort**.

# 18. Karma System
Users earn karma for:
- completing focus sessions
- evolving dragons
- finishing projects
- maintaining streaks
Karma can unlock:
- additional dragon eggs
- dragon skins
- environment upgrades

# 19. AI Responsibilities
AI is a central system in Ember.
Responsibilities:
1. Brain dump summarization
2. Task extraction
3. Insight extraction
4. Blocker detection
5. Session reflection analysis
6. Context restoration
7. Task prioritization suggestions
AI should always operate on **project memory + recent conversation context**.

# 20. Core Screens
### Home (Dragon Roost)
Shows:
- all active dragons
- growth state
- neglect state
- quick start session

### Project Screen
Displays:
- dragon
- task list
- backlog
- start session
- project summary

### Focus Session Screen
Displays:
- timer
- session tasks
- dragon animation

### Archives Screen
Displays:
- session history
- reflections
- milestones

### Analytics Screen
Displays:
- productivity insights
- dragon growth timeline

# 21. Emotional Design Goals
The product must evoke:
- responsibility
- curiosity
- pride
- attachment to projects
Users should feel:
“I need to check on my dragon.”

# 22. Success Metrics
Key indicators the product works:
1. Average sessions per week per user
2. Number of dragons reaching Adult stage
3. Project completion rate
4. User retention after 30 days
If dragons rarely evolve, the product has failed.

# 23. Future Potential Expansions
Possible future systems:
- cooperative dragon training
- shared accountability
- dragon trading
- AI co-working sessions
These are **not required for launch**.