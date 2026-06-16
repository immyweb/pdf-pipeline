---
name: code-review-agent
description: Run a code review using the code-reviewer subagent, for a specific file or for uncommitted changes.
---

Invoke the Agent tool with subagent_type "code-reviewer".

- If $ARGUMENTS is empty, ask the agent to review uncommitted changes (its default behavior).
- If $ARGUMENTS is a file path, ask the agent to review that file's full current contents instead of the diff.

Relay the agent's findings back to the user as-is.
