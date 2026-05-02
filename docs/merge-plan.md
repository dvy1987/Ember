# Ember Merge Plan For Open PR #3

## Purpose

This document defines a concrete execution plan for selectively merging the useful parts of open GitHub PR `#3` into the current `main` branch of Ember.

This is **not** a plan to merge PR `#3` directly.

PR `#3` is a parallel implementation of work that is already mostly present on `main`. It contains a mix of:

- duplicate functionality already merged through a different branch
- some useful product and UX improvements
- some architectural churn that should not be adopted
- some behavior regressions relative to Ember's product philosophy

The goal of this plan is to let an implementation agent port the **good parts only** while preserving the current architecture and product direction.

---

## Repository Context

### Current Git Context

The repository currently has:

- `main` aligned with `origin/main`
- a previously merged phases 11–15 branch already present on `main`
- an open PR `#3` from branch `feature/core-build-phases-11-15`

Observed history:

- `47d6e9d` = merge commit for earlier phases 11–15 work already on `main`
- PR `#3` points to a different head commit from a sibling branch that diverged from the same base

This means PR `#3` is **not missing work in bulk**. It is mostly a second implementation of the same phase.

---

## Product Lens

All decisions in this plan must be filtered through Ember's documented product principles:

- Ember is not a generic task manager
- Ember should minimize activation energy
- the Resume Card is the primary entry point into a project
- the app should help the user understand where they left off and start a 20-minute session quickly
- AI is a structured cognition layer, not a chatbot
- core functionality must remain offline-capable
- business logic must remain in services

The most important test is:

`Does this change make it easier for the user to open a project, understand where they were, and start a 20-minute focus session?`

---

## High-Level Decision

### Do Not Do

Do **not** merge PR `#3` directly.

Do **not** replace current `main` implementations wholesale in:

- `services/aiService.ts`
- `services/contextBuilder.ts`
- `app/project/[id]/page.tsx`
- `components/ResumeCard.tsx`
- analytics routing

Do **not** delete current routes simply because PR `#3` renamed or replaced them.

### Do Instead

Treat PR `#3` as a **donor branch**.

Port selected improvements into current `main` in a controlled sequence.

---

## Summary Of What To Keep vs Avoid

### Keep / Port

1. Reflection processing improvements that correctly apply `completed_tasks`
2. Better brain dump status feedback on the project page
3. In-app AI configuration:
   - settings API
   - settings modal
4. Per-project analytics as an additive feature
5. Non-blocking refresh of AI resume context after project load and after brain dump updates

### Avoid / Reject

1. Replacing `/api/resume` with `/api/ai/restore-context`
2. Deleting `/api/ai/summarize-project`
3. Replacing global analytics with project-only analytics
4. Moving memory compression trigger into reflection processing
5. Replacing the Resume Card’s “last session” emphasis with AI-only status emphasis
6. Wholesale rewrite of `aiService` and `contextBuilder`

---

## Functional Assessment Of PR #3

### Superior In PR #3

#### 1. Reflection actually updates completed tasks

Current `main` has a meaningful gap:

- reflection processing creates tasks, stores insights, and updates summary
- but it does not properly apply AI-reported completed tasks to the tasks table

PR `#3` includes explicit logic to mark matching tasks as completed.

This is more aligned with Ember's loop:

`focus session -> reflect -> project state updates`

#### 2. In-app settings for AI configuration

PR `#3` adds:

- `components/SettingsModal.tsx`
- `app/api/settings/route.ts`

This is a strong local-first UX improvement. Users should not need environment setup just to enable optional AI.

#### 3. Better project-page feedback during brain dump extraction

PR `#3` improves the project page by showing:

- extraction in progress
- AI extraction success
- fallback/manual task creation status

This improves clarity without adding friction.

#### 4. Per-project analytics fits the dragon metaphor

A project-specific analytics page tied to one dragon is more emotionally aligned than only global analytics.

The strongest value is:

- showing growth of a specific dragon
- reinforcing effort invested in one project

This should be added, not used to delete global analytics.

#### 5. Non-blocking AI resume refresh

PR `#3` fetches base project data first, then AI context separately.

This supports fast initial loading and fits the “start quickly” principle.

### Inferior In PR #3

#### 1. Compression trigger moved behind reflection route

PR `#3` triggers compression inside AI reflection processing.

That is wrong for Ember because:

- reflection is optional
- session completion should not depend on whether a reflection exists
- memory maintenance should remain tied to session lifecycle, not reflection usage

Current `main` is better here because compression checks are triggered after session end.

#### 2. Resume API naming and separation is worse

Current `main` uses `/api/resume`.

That is better than replacing it with `/api/ai/restore-context` because:

- it preserves product-language semantics
- it allows AI and fallback behavior behind one domain-specific route
- it keeps Resume Card behavior framed around product UX, not provider mechanics

#### 3. Resume Card in PR #3 over-weights AI-generated “status”

The PR shifts the card toward:

- AI status summary
- AI suggestion

This risks weakening the “what happened last session?” anchor.

Per Ember docs, the Resume Card should prominently preserve:

- last session
- suggested next step
- start session button

AI should enhance this, not replace it.

#### 4. Global analytics deletion is unnecessary

PR `#3` removes current global analytics routes/pages and replaces them with per-project analytics.

That is unnecessary churn.

The right product move is:

- keep global analytics
- add per-project analytics

---

## Execution Strategy

Implement the work in the following order:

1. Fix reflection-processing correctness
2. Add AI settings infrastructure
3. Improve project-page UX and AI context refresh behavior
4. Add per-project analytics without removing global analytics
5. Validate behavior and ensure route compatibility remains intact

This order is important because it delivers:

- correctness first
- configuration second
- UX improvements third
- additive product features last

---

## Detailed Work Plan

## Phase 1: Reflection Processing Correctness

### Goal

Ensure AI reflection results can mark completed tasks, add newly discovered tasks, store insights, and update session summaries correctly.

### Why

This is the most important functional gap currently visible on `main`.

Without this, Ember underserves the post-session reflection part of the product loop.

### Files To Modify

- [services/aiService.ts](C:/Users/reall/Building_Apps/Ember/services/aiService.ts)
- possibly [lib/types.ts](C:/Users/reall/Building_Apps/Ember/lib/types.ts) only if current result typing is insufficient

### Source Behavior To Reuse From PR #3

Reuse the **behavioral intent**, not a raw file replacement:

- detect `completed_tasks` from reflection output
- mark matching tasks completed in the DB
- set `completed_at`
- add newly extracted tasks while respecting active-task cap
- store insights
- update `sessions.ai_summary`

### Requirements

1. Preserve the current service architecture
2. Do not replace the whole AI service with PR `#3` version
3. Do not change route contracts unless necessary
4. Preserve graceful AI unavailability behavior
5. Keep data updates transactional where possible

### Important Design Notes

- Matching completed tasks by exact `task_text` may be fragile. If possible, improve safely.
- If exact text match is kept for now, document it as a limitation in code comments only if needed.
- Avoid automatic destructive behavior outside explicit completion updates from reflection output.

### Acceptance Criteria

- A reflection that references an active task as completed marks that task as `completed`
- `completed_at` is set
- new tasks from reflection are stored
- insights from reflection are stored
- `sessions.ai_summary` is populated when AI returns a useful summary/progress update
- no regression in existing brain dump AI flow

---

## Phase 2: In-App AI Settings

### Goal

Add UI and API support for configuring AI provider settings from inside the app.

### Why

This is strongly aligned with Ember's local-first philosophy:

- AI remains optional
- offline still works
- enabling AI should not require code edits or environment configuration

### Files To Add

- [components/SettingsModal.tsx](C:/Users/reall/Building_Apps/Ember/components/SettingsModal.tsx)
- [app/api/settings/route.ts](C:/Users/reall/Building_Apps/Ember/app/api/settings/route.ts)

### Files To Modify

- [app/page.tsx](C:/Users/reall/Building_Apps/Ember/app/page.tsx)
- [services/aiService.ts](C:/Users/reall/Building_Apps/Ember/services/aiService.ts)

### Required Behavior

Settings UI should allow:

- provider preset selection
- base URL entry
- model entry
- API key entry

Settings persistence should use the existing `settings` table.

### Important Adjustments From PR #3

Do not copy PR `#3` exactly without review. Adjust the implementation to fit current `main`.

Specific guidance:

1. Preserve env var fallback in `aiService`
   Current `main` supports env-based config. Keep that.

2. Expand settings support rather than replace current keys blindly
   Current `main` uses:
   - `openai_api_key`
   - `openrouter_api_key`

   PR `#3` uses:
   - `ai_api_key`
   - `ai_base_url`
   - `ai_model`

### Recommended Approach

Standardize carefully.

Preferred behavior:

- support a generic configuration path:
  - `ai_api_key`
  - `ai_base_url`
  - `ai_model`
- preserve backward compatibility with any existing provider-specific keys or env vars

### Suggested Resolution Logic In AI Service

Order:

1. generic DB config
2. legacy DB config if present
3. env vars

This avoids breaking existing setups while allowing the UI to become the preferred configuration path.

### Security Requirements

- never return raw API keys in GET responses
- mask or omit stored secret values
- only overwrite the stored API key if a new non-empty key is submitted

### Acceptance Criteria

- user can open settings from home page
- user can save AI settings into SQLite
- existing API key is not exposed on read
- AI service can resolve configuration from settings UI
- app still works fully when no AI key is configured

---

## Phase 3: Project Page UX Improvements

### Goal

Improve the project page so the brain dump and resume behavior feel more responsive and lower-friction.

### Files To Modify

- [app/project/[id]/page.tsx](C:/Users/reall/Building_Apps/Ember/app/project/[id]/page.tsx)

### Behavior To Port

From PR `#3`, selectively bring:

1. explicit brain dump loading state
2. explicit brain dump result state:
   - AI extracted tasks
   - fallback/manual tasks added
3. non-blocking refresh of resume context after initial load
4. non-blocking refresh of resume context after AI brain dump succeeds

### Behavior To Keep From Current Main

Keep the current high-level model:

- use `/api/resume`
- keep project screen wording grounded in Ember product language
- keep project loading straightforward

### Do Not Port

Do not switch project page to `/api/ai/restore-context`.

### Recommended Implementation Notes

Current `main` already calls:

- `fetchProject()`
- `fetchTasks()`
- `fetchSessions()`
- `fetchResumeContext()`

Improve this flow by:

- loading core project/task/session state first
- allowing resume context refresh after initial render if needed
- refreshing resume context after task extraction updates summary/tasks

### UX Requirement

Status messaging should stay lightweight.

Good:

- “Extracting tasks...”
- “AI extracted tasks”
- “Tasks added”

Bad:

- verbose banners
- technical provider language
- heavy modal interruptions

### Acceptance Criteria

- brain dump shows a clear in-progress state
- success/fallback outcome is visible briefly and clearly
- resume context refreshes after AI changes project state
- no increase in startup friction on project open

---

## Phase 4: Resume Card Preservation And Light Improvement

### Goal

Keep the Resume Card aligned with the PRD and avoid over-rotating into generic AI summaries.

### Files To Review Carefully

- [components/ResumeCard.tsx](C:/Users/reall/Building_Apps/Ember/components/ResumeCard.tsx)
- [app/api/resume/route.ts](C:/Users/reall/Building_Apps/Ember/app/api/resume/route.ts)
- [services/contextBuilder.ts](C:/Users/reall/Building_Apps/Ember/services/contextBuilder.ts)
- [services/aiService.ts](C:/Users/reall/Building_Apps/Ember/services/aiService.ts)

### Current Direction To Preserve

Current `main` is conceptually correct:

- product-specific resume route
- AI first, fallback second
- Resume Card remains grounded in actual project/session state

### Optional Small Enhancement

It is acceptable to lightly enhance the Resume Card visuals from PR `#3` if those changes are already consistent with current styling and do not change its information hierarchy.

Possible safe carryovers:

- subtle dragon breathing animation if consistent with existing styles
- mild glow/drop-shadow improvements

### Do Not Port

Do not make AI “status_summary” replace last-session visibility completely.

Preferred information hierarchy:

1. last session
2. suggested next step
3. start session CTA

AI-generated summary can support this, but should not obscure the last real user action.

### Acceptance Criteria

- Resume Card still prominently answers:
  - where was I?
  - what should I do next?
- Start 20-minute training remains the primary CTA
- fallback logic still works when AI is unavailable

---

## Phase 5: Per-Project Analytics As An Additive Feature

### Goal

Add project-specific analytics without deleting or breaking the current global analytics view.

### Why

Per-project analytics is emotionally aligned with Ember’s dragon metaphor.

It tells the story of one dragon’s growth, which is valuable and on-theme.

### Files To Add

- [app/analytics/[projectId]/page.tsx](C:/Users/reall/Building_Apps/Ember/app/analytics/[projectId]/page.tsx)
- [app/api/analytics/[projectId]/route.ts](C:/Users/reall/Building_Apps/Ember/app/api/analytics/[projectId]/route.ts)

### Files To Modify

- [services/analyticsService.ts](C:/Users/reall/Building_Apps/Ember/services/analyticsService.ts)
- [app/project/[id]/page.tsx](C:/Users/reall/Building_Apps/Ember/app/project/[id]/page.tsx)

### Files To Preserve

- [app/analytics/page.tsx](C:/Users/reall/Building_Apps/Ember/app/analytics/page.tsx)
- [app/api/analytics/route.ts](C:/Users/reall/Building_Apps/Ember/app/api/analytics/route.ts)

### Required Service Additions

Add or adapt helpers for:

- `getProjectDailyStats(projectId, days?)`
- `getRecentSessions(projectId, limit?)`
- stage-growth timeline logic suitable for project display

### Important Note About Current Main

Current `main` already has a `getDragonGrowthTimeline(projectId)` function, but it reads milestones.

PR `#3` uses a different concept:

- derive growth points from cumulative session minutes

Do not overwrite blindly.

### Recommended Approach

Keep both concepts if useful:

- milestone/history view for known milestone records
- computed stage-progression timeline for project growth analytics

If naming collides, use distinct names.

Example:

- `getProjectMilestones(projectId)`
- `getComputedDragonGrowthTimeline(projectId)`

### UX Goal

From a project page, the user should be able to inspect:

- total focus invested in this dragon
- session count
- average session length
- current stage and next-stage progress
- recent sessions / reflections

This is secondary to Resume Card and focus flow, but still product-consistent.

### Acceptance Criteria

- global analytics still works
- new per-project analytics route works
- project page links to per-project analytics
- no route or service regressions

---

## Phase 6: Memory Compression Safety Review

### Goal

Leave current trigger placement intact while optionally improving internal compression logic if needed.

### Files To Review

- [services/aiService.ts](C:/Users/reall/Building_Apps/Ember/services/aiService.ts)
- [app/api/sessions/end/route.ts](C:/Users/reall/Building_Apps/Ember/app/api/sessions/end/route.ts)

### Rules

1. Keep compression check triggered from session lifecycle, not reflection route
2. Never delete raw sessions
3. Keep compressed memory in `project_memory`
4. Preserve offline functionality

### Warning About PR #3 Logic

PR `#3` uses a version-based estimate:

- `memory_version * 5`

to infer sessions processed.

This may be acceptable in some implementations, but it also risks repeated compression behavior once total sessions exceed the threshold.

Do not port this blindly.

### Recommended Action

Unless there is a clearly demonstrated bug in current `main`, do not refactor compression trigger logic during this merge plan.

Only make changes here if needed to support Phase 1 correctness or Phase 2 settings integration.

---

## Routes Compatibility Policy

The following existing routes should remain unless there is a strong reason to change them:

- `/api/resume`
- `/api/analytics`
- `/api/ai/summarize-project`

The following routes may be added:

- `/api/settings`
- `/api/analytics/[projectId]`

Avoid replacing domain-oriented routes with lower-level AI-provider-oriented names when the current domain route is already correct.

---

## File-Level Implementation Matrix

### Add

- `docs/merge-plan.md`
- `components/SettingsModal.tsx`
- `app/api/settings/route.ts`
- `app/analytics/[projectId]/page.tsx`
- `app/api/analytics/[projectId]/route.ts`

### Modify

- `app/page.tsx`
- `app/project/[id]/page.tsx`
- `services/aiService.ts`
- `services/analyticsService.ts`
- possibly `lib/types.ts`
- optionally `components/ResumeCard.tsx` for small visual refinement only

### Preserve As-Is Or Nearly As-Is

- `app/api/resume/route.ts`
- `app/api/analytics/route.ts`
- `app/api/ai/summarize-project/route.ts`
- `services/contextBuilder.ts` structure
- `app/api/sessions/end/route.ts` compression trigger placement

### Do Not Delete

- `app/analytics/page.tsx`
- `app/api/analytics/route.ts`
- `app/api/resume/route.ts`
- `app/api/ai/summarize-project/route.ts`

---

## Suggested Implementation Sequence For Another Agent

1. Read:
   - `docs/PRD.md`
   - `docs/master-prompt.md`
   - `docs/architecture-guard.md`
   - `docs/ai-system-architecture.md`
   - `docs/memory-compression.md`
   - `docs/resume-card.md`
   - this file

2. Fix reflection processing in `services/aiService.ts`

3. Add AI settings route and modal

4. Wire settings entry point into `app/page.tsx`

5. Upgrade project-page brain dump feedback and resume refresh behavior

6. Add per-project analytics route/page and service helpers

7. Link project page to per-project analytics

8. Run validation and regression checks

---

## Validation Checklist

### Reflection Flow

- Start a session
- Complete at least one selected task
- Enter a reflection that clearly mentions completion
- Confirm task status becomes `completed`
- Confirm completed task disappears from active list or is otherwise correctly represented
- Confirm `sessions.ai_summary` gets populated when AI returns usable output

### No-AI Fallback

- With no AI config, app still loads
- brain dump still adds tasks
- Resume Card still shows fallback info
- session flow still works

### AI Settings

- Open settings from home page
- Save provider/base URL/model/API key
- Confirm settings persist in SQLite
- Confirm GET route does not expose raw key
- Confirm AI features begin resolving config from saved settings

### Resume Behavior

- Project opens without noticeable added delay
- Resume Card still surfaces last-session context
- suggested next step remains actionable
- Start 20-minute training CTA remains primary

### Analytics

- `/analytics` global page still works
- `/analytics/[projectId]` works
- project page links to per-project analytics
- per-project page shows meaningful project-specific stats

---

## Non-Goals

This merge plan does **not** include:

- direct merging of PR `#3`
- renaming core resume flow around `/api/ai/restore-context`
- deleting current analytics
- a full AI-service rewrite
- database schema redesign beyond what is already present
- major visual redesign beyond targeted UX improvements

---

## Final Instruction To Implementation Agent

Use PR `#3` only as a **reference donor**.

Do not try to make `main` look like PR `#3`.

The correct outcome is:

- current `main` architecture preserved
- current product framing preserved
- selected functional and UX improvements absorbed
- no route deletions that break existing features
- no regression in offline-first behavior

If there is a tradeoff between “more AI” and “faster clearer resume/start flow,” choose the faster clearer resume/start flow.
