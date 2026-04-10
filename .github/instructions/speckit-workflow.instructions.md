---
description: "Use when working with Spec Kit tasks, GitHub issues, task synchronization, MCP, speckit.createissues, or speckit.implementfromissues. Defines the shared workflow conventions for the PokeFusions capstone project."
---

# Spec Kit Issue-Driven Workflow

This project uses GitHub's Spec Kit (`github/spec-kit`) for spec-driven development. The standard workflow is:

1. `/speckit.constitution` — establish project principles
2. `/speckit.specify` — define what to build
3. `/speckit.plan` — create the technical implementation plan
4. `/speckit.tasks` — generate the task breakdown
5. `/speckit.taskstoissues` — push tasks to GitHub Issues via MCP (built-in)
6. `/speckit.implementfromissues` — select the next unblocked issue and implement it (custom)

Steps 1–5 are built-in Spec Kit commands. Step 6 is a custom addition for this project.

## Issue Creation (speckit.taskstoissues)

Use the built-in `/speckit.taskstoissues` command. It reads tasks.md and creates one GitHub issue per task via the GitHub MCP server. Do not use a separate custom issue-creation command.

## Issue-Driven Implementation (speckit.implementfromissues)

This is the custom workflow addition. It:

1. Queries open GitHub issues created by `/speckit.taskstoissues`.
2. Skips issues whose prerequisite tasks are still open.
3. Selects the next unblocked issue.
4. Loads the authoritative Spec Kit artifacts (spec.md, plan.md, tasks.md) before implementing.
5. Implements the task following Spec Kit conventions.
6. Reports completion or blockers back to the GitHub issue.
7. Asks whether to continue to the next issue.

## Key Rules

- **Spec Kit artifacts are the source of truth.** Issues are the execution queue, but implementation must always reload spec/plan/tasks before coding.
- **Wrapper-only integration.** This project does not modify Spec Kit internals. Custom workflow additions live in `.github/prompts/` and `.github/instructions/`.
- **One issue at a time.** The implementation loop processes issues sequentially.
- **Dependencies matter.** Do not implement an issue if its prerequisite tasks are still open.
