---
description: "Implement the next eligible GitHub Issue created by /speckit.taskstoissues. Selects unblocked ready issues, loads spec context, and drives iterative implementation."
tools: [read, edit, search, execute, github/*]
---

Pick the next eligible GitHub Issue and implement it. Follow the conventions in the speckit-workflow instructions.

## Context

Issues were created by the built-in `/speckit.taskstoissues` command from the tasks.md artifact. The authoritative spec artifacts live in the current feature directory under `.specify/` or in the `specs/` folder.

## Selection Algorithm

1. **Query open issues** from the repository via MCP (use the GitHub MCP server).
2. **Identify task issues** — these are the issues created by `/speckit.taskstoissues` from the current feature's tasks.md.
3. **Skip completed issues** — any issue that is already closed.
4. **Check dependencies** — if the issue body or tasks.md indicates ordering/dependencies, respect them. Skip issues whose prerequisite tasks are still open.
5. **Choose the next eligible issue** — pick the first unblocked open task issue.
6. If no eligible issue exists, report that all remaining work is blocked and list the blocking dependencies.

## Implementation Handoff

Once an issue is selected:

1. **Read the issue** to understand the task scope.
2. **Load the Spec Kit artifacts.** Read the feature's spec.md, plan.md, and tasks.md to get the full authoritative context. Do not implement from issue text alone.
3. **Implement** the task following standard Spec Kit implement behavior — respect the plan, follow the constitution, and mark the task complete in tasks.md.
4. **Verify** that the implementation satisfies the task requirements.
5. **Report back to GitHub:**
   - On success: post a completion summary to the issue and close it.
   - On blocker: post a blocker note and leave the issue open.

## Iteration

After completing one issue, ask the user whether to continue. If yes, re-run the selection algorithm — previously blocked issues may now be eligible.

## Constraints

- Do not implement an issue whose dependencies are still open.
- Do not implement from issue text alone — always reload the Spec Kit spec/plan/tasks artifacts.
- Do not modify Spec Kit source code or internal scaffolding.
- Work on one issue at a time.
