# Show HN — Ember

Draft post for launch. Update URLs and screenshots before posting.

## Title options

- **Show HN: Ember – local-first focus app where projects are dragons that remember**
- **Show HN: Ember – ADHD productivity via a sacred 20-minute training loop (local + MCP)**

## Post body (draft)

Hi HN — I built **Ember**, a local-first app for ADHD-style project momentum. Projects are dragons. The job isn't task management — it's **starting** and **coming back**.

**Sacred loop:** open → dragon remembers where you left off → one tap → train (default 20 min) → reflect → better resume next time.

### Try it

- **60-second walkthrough:** `http://localhost:5000/?demo=1` (after local install)
- **Full loop:** [docs/launch.md](./launch.md)
- **From Cursor:** MCP tools for open project, begin training, brain dump — [docs/mcp-setup.md](./mcp-setup.md)

### Why dragons

Emotional progress matters for ADHD brains. A creature that grows when you show up beats another kanban board.

### Tech

- React + Vite + Express + SQLite
- `lib/ember-core` — single domain layer for web + MCP
- BYOK — no bundled AI; use your key in-app or via Cursor

### What's in v1

- Resume Card ritual
- Configurable session length (15/20/25/45)
- Insight tray (memory + contradictions, no graph UI)
- Ritual metrics in Insights
- MCP for power users

### Ask

I'd love feedback on whether the **first 30 seconds** feel clear — and whether MCP is a viable primary path for technical users without a web API key.

GitHub: [link]

---

## Demo links for post

| Audience | Link |
|----------|------|
| Casual | `/?demo=1` |
| Builders | README quick start |
| Cursor users | mcp-setup.md |

## Screenshots to capture

1. **Ember Keep** — hero dragon + calling reason
2. **Resume Card** — "Your dragon remembers" + train CTA
3. **Insight tray** — contradictions badge
4. **Training insights** — ritual metrics hero

Save under `docs/assets/launch/` (create when capturing).

## Launch checklist

- [ ] README + launch.md tested by someone who didn't write them
- [ ] `pnpm test` + `smoke-ritual.sh` green
- [ ] MCP connects in fresh Cursor window
- [ ] `/?demo=1` completes in <2 min
- [ ] Post links verified
