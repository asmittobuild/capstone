<!--
  Sync Impact Report
  Version change: 1.0.0 → 1.0.1
  Bump rationale: PATCH — clarify terminology in Principle IV

  Changed:
  - IV. Deterministic Core: "compatibility matrix" → "type-compatibility check"
    to align with spec Key Entities and tasks terminology

  Templates requiring updates: none (clarification only)
  Follow-up TODOs: none
-->

# PokeFusions Constitution

## Core Principles

### I. Graceful Degradation

The app MUST function fully with only the required
dependency (Hugging Face text generation) available.
Optional services — PokeAPI flavor text and Stable
Diffusion image generation — MUST fail silently with
well-defined fallback behavior:

- PokeAPI unavailable: skip flavor text enrichment
- Stable Diffusion unreachable: display the Pokemon logo
  as the fusion image placeholder
- No optional service failure may block fusion generation
  or break the user experience

**Rationale**: The app integrates multiple external and
local services with varying availability. Users must
never see a broken state because an optional service
is offline.

### II. Local-First Architecture

All persistence MUST use browser localStorage. The app
MUST NOT require a hosted database, user accounts, or
cloud sync for v1. Image generation is a local-only
optional feature available only when the user's local
Stable Diffusion service is reachable.

- Saved fusions persist in localStorage across browser
  sessions
- No server-side persistence or authentication
- Deployed environments MUST degrade cleanly when the
  local image service is unreachable

**Rationale**: This is a capstone prototype scoped for
single-user local use. Keeping persistence and image
generation local avoids infrastructure complexity and
keeps the project focused on the AI fusion pipeline.

### III. Spec-Driven Workflow

All features MUST flow through the Spec Kit workflow:
constitution → specify → plan → tasks → issues →
implement. Implementation MUST be traceable to spec
artifacts. The `/speckit.taskstoissues` command pushes
tasks to GitHub Issues, and `/speckit.implementfromissues`
drives iterative implementation from issue state.

- Do not implement features without a corresponding spec
- Do not modify Spec Kit internals — use wrapper-only
  customizations in `.github/`
- GitHub Issues are the execution queue; Spec Kit
  artifacts remain the source of truth

**Rationale**: The bootcamp workflow requires structured
spec-driven development. GitHub Issues provide execution
tracking and traceability without replacing the spec as
the authoritative source.

### IV. Deterministic Core, AI-Augmented Surface

Core fusion mechanics — stat averaging, type compatibility
filtering, data lookup — MUST be deterministic and
testable without AI. AI (Hugging Face) generates the
creative surface: fusion names, descriptions, and
optional images. These two layers MUST be separated so
the fusion pipeline can be tested and debugged without
depending on AI availability.

- Stat calculation: simple average of parent stats,
  integer-rounded
- Type compatibility: deterministic type-compatibility
  check function (not a precomputed matrix)
- Pokemon data: base species only, sourced from a local
  dataset
- AI outputs: names, descriptions, images — always
  generated, never cached as canonical data

**Rationale**: Mixing deterministic logic with
non-deterministic AI outputs makes debugging and testing
unreliable. Clean separation ensures the core pipeline
is predictable and the AI layer can be tuned or swapped
independently.

### V. Responsive & Accessible UX

The UI MUST be responsive across mobile and desktop
viewports. Loading states, error states, and empty states
MUST be handled explicitly. Dark mode MUST be supported.

- Loading skeleton cards during generation
- Toast notifications with 3-second auto-dismiss
- Error state with retry button on all failure paths
- Responsive layout with mobile-first breakpoints
- Smooth transitions and animations

**Rationale**: A capstone project demonstrates
engineering quality. Handling all UI states explicitly
shows maturity beyond the happy path.

## Technology & Scope Constraints

- **Pokemon scope**: base species only (no regional
  variants, megas, or special forms in v1)
- **Required API**: Hugging Face chat completions
  (OpenAI-compatible endpoint, bearer token auth)
- **Optional APIs**: PokeAPI (flavor text, cached
  in-memory), Stable Diffusion WebUI (localhost:7860,
  base64 image response)
- **Persistence**: browser localStorage only
- **Development tool**: GitHub Copilot with Spec Kit
- **MCP**: GitHub MCP server for issue management

## Development Workflow

1. `/speckit.constitution` — this document
2. `/speckit.specify` — define feature requirements
3. `/speckit.plan` — technical implementation plan
4. `/speckit.tasks` — task breakdown
5. `/speckit.taskstoissues` — push tasks to GitHub Issues
6. `/speckit.implementfromissues` — implement from issues
7. Subagents are encouraged for parallel or isolated work
8. All implementation must reload spec/plan/tasks context
   before coding — issue text alone is not sufficient

## Governance

This constitution is the highest-authority document for
the PokeFusions project. All specs, plans, and
implementation must comply with these principles.

- **Amendments**: require an explicit version bump,
  documented rationale, and propagation check across
  dependent templates
- **Versioning**: semantic versioning (MAJOR for principle
  changes, MINOR for additions, PATCH for clarifications)
- **Compliance**: every plan.md must include a Constitution
  Check gate that validates alignment before implementation

**Version**: 1.0.1 | **Ratified**: 2026-04-10 | **Last Amended**: 2026-04-11
