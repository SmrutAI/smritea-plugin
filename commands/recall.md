---
description: Search SmriTea memories for context relevant to a topic
---

Search SmriTea memories for context relevant to: $ARGUMENTS

Steps:
1. Call `search_memories` with the topic as query and `limit: 10`
2. If results are sparse or not relevant, try again with a broader or rephrased query
3. Summarize the relevant memories found in a concise paragraph before continuing
4. If no memories found, say so and proceed without fabricating context
