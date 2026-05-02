# Product Soul: Ember

Version: 1.0 | Date: 2026-05-02 | Status: Pre-PMF hypothesis (single user / dogfood)

## The User

**Primary user:** A working adult with ADHD juggling 3–6 long-running personal or professional projects (a side product, a writing piece, a course they're taking, a renovation, a research thread). Cognitive cost of context-switching is brutal — they routinely lose 20–40 minutes "loading" a project back into working memory after even a one-day gap. Many days they don't sit down at all, because the loading cost feels bigger than the available focus window.

**Current behaviour:** Notion / Apple Notes / Things 3 / Linear used as inert task storage. They re-read their own notes to remember where they were, get demoralised by the gap between "what I planned to do" and "what is realistic right now", and often abandon the session before starting. Or they bounce between projects every few minutes because no single one feels primed.

**Their words:** "I just want to sit down for 20 minutes on the right thing without spending 20 minutes figuring out what the right thing is."

## The Business

**Model:** Solo / indie SaaS. Free tier (1–3 dragons), paid tier ($6–8/mo) for unlimited dragons, AI brain-dump extraction, AI-resume context, and analytics. Bring-your-own-key for AI keeps marginal cost near zero.

**Year 1 must-be-true:** 100 paying users with >60-day retention. Single dogfood user (the builder) ships sessions weekly and would notice if it broke.

**Year 3 must-be-true:** Default tool of choice for the "ADHD project juggler" niche, ~3k paying users, ~$20k MRR, profitable as a one-person business.

**Biggest risk:** Apple/Notion/Linear adds a "resume here" surface that's 60% as good but free.

## The Strategy

**Alternatives:** Things 3 (no memory of context, no AI), Linear (built for teams, hostile to solo emotional projects), Notion (too configurable — the configuration becomes the procrastination), Sunsama / Akiflow (calendar-centric, not project-centric), pen + paper (the actual incumbent).

**Moat:** The dragon-as-project metaphor + the Resume Card ritual + AI-distilled "here's where you left off, here's the next move" packaged as the *first thing you see when you open a project*. It's not a feature, it's the primitive interaction. Notion can't bolt this on without rewriting their information model. Linear won't because their customer is the engineering org, not the ADHD individual.

**Strategic bet:** ADHD-focused productivity is a real, underserved segment, and the dragon metaphor is emotionally sticky enough to overcome the "it's just another todo app" reflex. The visible decay of a neglected dragon creates accountability without nagging notifications.

## Product-Market Fit

**Status:** Pre-PMF. One real user (builder) using it weekly. Public launch hasn't happened.

**The ritual that has to work:**
1. User opens project → Resume Card answers "where was I" in <3 seconds.
2. User taps **Start 20-minute training** without thinking about it.
3. After 20 min, reflection prompt → AI extracts what changed → next session's Resume Card is even better primed.

If steps 1 and 2 don't feel ritualistic and effortless, nothing else matters.

**PMF signal threshold:** >50% of activated users return for a 4th session within their first 14 days, AND avg time from app-open → session-start is under 30 seconds.

**Not-PMF signal:** Users open the app, look around, and don't start a session. Or they start one session per project and never return — which means it's a tutorial, not a habit.

## GTM Distribution

**First user finds Ember via:** ADHD subreddits + ADHD productivity Twitter/X + Hacker News Show HN. The wedge content is "I built this for myself because Notion was killing my projects" — vulnerable, specific, anti-template.

**Wedge channel:** Show HN + a single deeply-personal essay on the builder's blog about why this exists. Word-of-mouth inside ADHD communities does the rest, slowly.

**Acquisition → Activation → Retention loop:** Read essay / Show HN → sign up → create first dragon (activation: completing a 20-min session within day 1) → return for a second project / second session (retention signal: dragon hatches into adolescent stage) → recommend to one ADHD friend.

## What this means for the redesign (this section is for the design subagents, not investors)

- **The dragon metaphor stays.** It is the moat. It cannot be reduced to a generic SaaS card. But it must NOT be presented like a Pokémon — that reads childish and undermines the "tool a real adult chose" positioning.
- **The Resume Card is THE product moment.** Its information sequence (dragon identity → last session → suggested next move → 20-min CTA) is sacred. Visual treatment is wide open. The 20-min CTA must be reachable in one tap from app open.
- **No emoji as load-bearing UI.** Emoji says "I asked an LLM to design this." A real custom icon set, even a small one, is mandatory.
- **No `system-ui`. No dark-navy + flat-orange tech-startup palette. No `rounded-2xl shadow-md` SaaS card grid.** All three are the visual signature of "indie project an LLM made"; all three undermine the "trusted companion" positioning.
- **Calm ≠ colourless.** This is a personal-utility app per the design doctrine — restful, deliberate colour drawn from the product's identity, not gray-on-white emptiness.
- **The product is emotional, not clinical.** A clean enterprise look would kill it. A toy/game look would also kill it. The target is closer to a personal journal, a hand-bound notebook, or a quiet morning ritual than a project management tool.

## Open Hypotheses
- [ ] Will users adopt the dragon metaphor or find it cringe at scale (current sample: 1)?
- [ ] Is the 20-minute fixed session length the right primitive, or do users want flexibility?
- [ ] Will bring-your-own-key AI be acceptable to the target segment, or does it need to be invisibly bundled?
