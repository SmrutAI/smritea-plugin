---
name: memory-workflow
description: Guide for using SmriTea memory tools to persist and recall context across sessions
---

# SmriTea Memory Workflow

SmriTea provides persistent AI memory across sessions. Use these tools to remember important context and recall it
later.

## When to Save Memories (`add_memory`)

Call `add_memory` when the user:

- States a preference ("I prefer functional error handling", "always use tabs")
- Makes a correction that should stick ("don't use that pattern, use X instead")
- Makes a technical decision ("we're going with ArangoDB for the graph layer")
- Explicitly asks you to remember something ("remember that...", "keep in mind that...")
- Shares important project context ("this service handles billing", "we use CockroachDB")

**Actor model — use the right actor type:**

- `user` — user preferences, corrections, and personal style choices
- `agent` — things you (the AI) have learned about the codebase or task
- `system` — project-level context, architecture decisions, team conventions

---

## When to Search Memories (`search_memories`)

Call `search_memories` when:

- Starting a new task (search for relevant past context before diving in)
- The user references something from the past ("like we discussed", "remember when...")
- You encounter an unfamiliar pattern or decision ("why is it done this way?")
- The user's request seems to assume prior knowledge you don't have

**Always search before starting a significant task** — don't wait to be asked.

---

## Tips

- Keep memories concise and factual — one clear idea per memory
- Don't store temporary or session-specific context (e.g., "we're currently debugging X")
- Do store durable facts (preferences, decisions, patterns, conventions)
- After storing, confirm to the user: "I'll remember that."
