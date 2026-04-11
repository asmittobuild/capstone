# Tasks: PokeFusions Core

**Input**: Design documents from `/specs/001-pokefusions-core/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and base configuration

- [ ] T001 Initialize Vite + React + TypeScript project with `npm create vite@latest` in repository root
- [ ] T002 Install core dependencies: react-router-dom, dompurify, @types/dompurify, uuid, @types/uuid
- [ ] T003 [P] Configure Tailwind CSS 3 with dark mode class strategy in tailwind.config.ts and src/index.css
- [ ] T004 [P] Configure Vitest and React Testing Library in vite.config.ts and tests/setup.ts
- [ ] T005 [P] Configure ESLint and Prettier for TypeScript + React in .eslintrc.cjs and .prettierrc
- [ ] T006 [P] Configure Vite for GitHub Pages deployment with correct base path in vite.config.ts
- [ ] T007 Create base TypeScript types for Pokemon, PokemonStats, Fusion, FusionParent, and Settings in src/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data layer, service clients, and shared UI primitives that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Add bundled Pokemon dataset (809 species, Gens 1–7) as src/data/pokedex.json
- [ ] T009 Implement Pokemon data access module with getAll, getById, getByName, and getTypes utilities in src/lib/pokemon.ts
- [ ] T010 [P] Implement DOMPurify sanitization wrapper with restricted allow-list (b, i, em, strong, p, br) in src/lib/sanitize.ts
- [ ] T011 [P] Implement deterministic stat averaging function (Math.round per stat) in src/lib/fusion.ts
- [ ] T012 [P] Implement type-compatibility check function (exclude pairs with identical type combinations) in src/lib/fusion.ts
- [ ] T013 Implement Hugging Face chat completions client with auth, request/response parsing, rate-limit detection (HTTP 429 + Retry-After header), automatic retry-once on empty or malformed AI responses, and error handling in src/services/huggingface.ts
- [ ] T014 [P] Implement PokeAPI flavor text client with language filtering, version preference, in-memory caching, and silent fallback in src/services/pokeapi.ts
- [ ] T015 [P] Implement Stable Diffusion WebUI client with availability probe, txt2img request, base64 response handling, and silent fallback in src/services/stablediffusion.ts
- [ ] T016 [P] Implement useLocalStorage custom hook for typed get/set with JSON serialization and quota detection in src/hooks/useLocalStorage.ts
- [ ] T017 [P] Implement useToast custom hook for toast notification state management (success, error, info with 3s auto-dismiss) in src/hooks/useToast.ts
- [ ] T018 Implement SettingsContext provider with apiToken, modelId, theme state (light/dark/system), localStorage persistence, first-run detection, and dark mode class-based switching on document root (so all subsequent components can use Tailwind dark: variant from the start) in src/context/SettingsContext.tsx
- [ ] T019 [P] Create Toast notification component with auto-dismiss animation and success/error/info variants in src/components/ui/Toast.tsx
- [ ] T020 [P] Create SkeletonCard loading placeholder component with shimmer animation in src/components/ui/SkeletonCard.tsx
- [ ] T021 [P] Create Button component with loading, disabled, and variant states in src/components/ui/Button.tsx
- [ ] T022 [P] Create TypeBadge component for Pokemon type display with type-specific colors in src/components/ui/TypeBadge.tsx
- [ ] T023 Set up HashRouter with routes for home (/), select (/select), collection (/collection), and settings (/settings) in src/App.tsx
- [ ] T024 Create main entry point mounting App with SettingsContext provider in src/main.tsx
- [ ] T025 [P] Create StorageWarning banner component that appears at ~80% localStorage capacity with informative message (FR-027) in src/components/ui/StorageWarning.tsx

**Checkpoint**: Foundation ready — all shared services, utilities, types, and UI primitives are in place. User story implementation can now begin.

---

## Phase 3: User Story 1 — Generate a Random Fusion (Priority: P1) 🎯 MVP

**Goal**: User clicks "Generate Fusion" and sees a fusion card with AI-generated name, description, averaged stats, and optional image for a randomly selected compatible pair.

**Independent Test**: Click "Generate" on the home page → loading skeleton appears → fusion card displays with blended name, averaged stats, AI description, and image/placeholder.

### Implementation for User Story 1

- [ ] T026 [US1] Implement fusion generation orchestrator: random pair selection → stat averaging → HF text generation (max 12s timeout) → optional PokeAPI flavor text (max 3s, abort if slower) → optional SD image (non-blocking, max 15s) → assemble Fusion object. Total text-generation path must complete within 15s per SC-001. In src/lib/fusion.ts
- [ ] T027 [US1] Implement AI response parser to extract fusion name and description from HF chat completion content with fallback name generation in src/lib/fusion.ts
- [ ] T028 [US1] Implement FusionContext provider with current fusion state, generate action, loading/error states, rate-limit cooldown timer (parse Retry-After / X-RateLimit-Reset headers), and Generate button disable/re-enable logic (FR-024) in src/context/FusionContext.tsx
- [ ] T029 [P] [US1] Create FusionCard component displaying fusion name, parent names with TypeBadges, six color-coded stats (green/yellow/red by value) with total, sanitized AI description, image or Pokemon logo placeholder, creation timestamp, and action buttons in src/components/FusionCard/FusionCard.tsx
- [ ] T030 [P] [US1] Create StatBar sub-component with color coding (green ≥100, yellow ≥50, red <50) and value display in src/components/FusionCard/StatBar.tsx
- [ ] T031 [US1] Create HomePage with "Generate Fusion" button, API token check gate (FR-023), loading skeleton, error state with retry, rate-limit cooldown display, and fusion card output in src/pages/HomePage.tsx
- [ ] T032 [US1] Wire FusionContext provider into App.tsx wrapping all routes in src/App.tsx

**Checkpoint**: User Story 1 is complete. User can generate random fusions with one click. This is the MVP.

---

## Phase 4: User Story 2 — Select Two Pokemon Manually (Priority: P2)

**Goal**: User browses/searches the full Pokemon roster, picks two specific Pokemon, and generates a fusion for that pair.

**Independent Test**: Navigate to /select → browse/search roster → pick two different Pokemon → click "Fuse" → fusion card appears with correct parents.

### Implementation for User Story 2

- [ ] T033 [P] [US2] Create PokemonSelector component with searchable/filterable grid of 809 Pokemon showing name, sprite placeholder, and types in src/components/PokemonSelector/PokemonSelector.tsx
- [ ] T034 [P] [US2] Create PokemonCard mini-component for each selectable Pokemon entry in the grid in src/components/PokemonSelector/PokemonCard.tsx
- [ ] T035 [US2] Implement manual fusion generation flow in FusionContext: accept two specific Pokemon IDs, validate different Pokemon (FR-003), generate fusion same pipeline as random in src/context/FusionContext.tsx
- [ ] T036 [US2] Create SelectPage with two selection slots, same-Pokemon validation message, search/filter bar, "Fuse" button, and fusion card output in src/pages/SelectPage.tsx

**Checkpoint**: User Stories 1 and 2 are both functional. Users can generate fusions randomly or by manual selection.

---

## Phase 5: User Story 3 — Save and Manage Fusions (Priority: P3)

**Goal**: User saves generated fusions to localStorage, browses their collection, and deletes fusions they don't want.

**Independent Test**: Generate a fusion → click "Save" → toast confirms → navigate to /collection → fusion is displayed → close browser → reopen → fusion persists → click "Delete" → fusion removed.

### Implementation for User Story 3

- [ ] T037 [US3] Implement saved fusions state management in FusionContext: save (strip imageBase64 per FR-026), load from localStorage, delete, localStorage quota check at ~80% capacity (show StorageWarning component from Phase 2), and block saves with informative message when storage is full (FR-027) in src/context/FusionContext.tsx
- [ ] T038 [US3] Add Save and Delete action buttons to FusionCard with appropriate visibility (Save when unsaved, Delete when viewing collection) in src/components/FusionCard/FusionCard.tsx
- [ ] T039 [P] [US3] Create Collection component displaying saved fusions as a grid of FusionCards, with an empty state component showing guidance message when no fusions are saved, in src/components/Collection/Collection.tsx and src/components/Collection/EmptyState.tsx
- [ ] T040 [US3] Create CollectionPage with Collection component, empty state with guidance, and navigation in src/pages/CollectionPage.tsx

**Checkpoint**: User Stories 1–3 are functional. Core experience is complete: generate, view, save, browse, delete.

---

## Phase 6: User Story 4 — View AI-Generated Fusion Image (Priority: P4)

**Goal**: When the local Stable Diffusion service is available, fusion cards show an AI-generated Pokemon-style image. When unavailable, a Pokemon logo placeholder is shown.

**Independent Test**: Generate a fusion with SD running → image appears on card. Stop SD → generate again → placeholder appears with no error.

### Implementation for User Story 4

- [ ] T041 [US4] Implement image generation integration in the fusion orchestrator: probe SD availability, generate image if available, attach base64 to Fusion, fall back to null silently in src/lib/fusion.ts
- [ ] T042 [US4] Add Pokemon logo placeholder asset as src/assets/pokemon-logo.png
- [ ] T043 [US4] Update FusionCard to display imageBase64 as inline image when present, or Pokemon logo placeholder when null, with smooth fade-in transition in src/components/FusionCard/FusionCard.tsx

**Checkpoint**: User Stories 1–4 are functional. Fusions show AI images when available, placeholder when not.

---

## Phase 7: User Story 5 — Regenerate a Fusion (Priority: P5)

**Goal**: User clicks "Regenerate" on a fusion card to get a new AI-generated name and description for the same parent pair without re-selecting.

**Independent Test**: Generate a fusion → note the name/description → click "Regenerate" → loading state appears → name and description change, parents stay the same.

### Implementation for User Story 5

- [ ] T044 [US5] Implement regenerate action in FusionContext: same parent pair, new HF text generation call, replace name/description/image on current fusion, preserve ID and createdAt in src/context/FusionContext.tsx
- [ ] T045 [US5] Add Regenerate button to FusionCard with loading state during regeneration and visual indicator that re-save is needed if previously saved in src/components/FusionCard/FusionCard.tsx

**Checkpoint**: User Stories 1–5 are functional. Full generation lifecycle: create, view, save, regenerate, delete.

---

## Phase 8: User Story 6 — Polished Responsive Experience (Priority: P6)

**Goal**: The app provides a polished experience with dark mode, responsive layout, smooth animations, and clear feedback for all states.

**Independent Test**: Use app on mobile and desktop viewports → toggle dark mode → verify all states (loading, error, empty, success) render correctly with transitions.

### Implementation for User Story 6

- [ ] T046 [US6] Create Settings page with API token input, model ID input with default value, and theme toggle (light/dark/system) in src/pages/SettingsPage.tsx
- [ ] T047 [US6] Implement system theme preference detection (prefers-color-scheme media query) and theme toggle UI refinement (light/dark/system selector) in src/context/SettingsContext.tsx
- [ ] T048 [P] [US6] Add responsive layout and navigation (navbar with route links, mobile hamburger menu) in src/App.tsx
- [ ] T049 [P] [US6] Add Tailwind responsive utilities to all page layouts for 320px–2560px viewport range in src/pages/HomePage.tsx, src/pages/SelectPage.tsx, src/pages/CollectionPage.tsx
- [ ] T050 [P] [US6] Add CSS transitions and animations for card appearance, theme switching, toast enter/exit, and skeleton shimmer in src/index.css

**Checkpoint**: All 6 user stories are complete. Full polished experience across devices.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final polish, validation, and deployment readiness

- [ ] T051 [P] Configure GitHub Pages deployment workflow in .github/workflows/deploy.yml
- [ ] T052 Validate all AI-generated text passes through DOMPurify sanitization — audit every render path for unsanitized content (FR-028)
- [ ] T053 Run quickstart.md validation: fresh clone, install, dev server, generate fusion, save, reload, verify persistence
- [ ] T054 Final build verification: npm run build succeeds, preview serves correctly, no console errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (project must be initialized)
- **Phase 3–8 (User Stories)**: All depend on Phase 2 (foundational must be complete)
  - US1 (Phase 3): No dependency on other stories — **this is the MVP**
  - US2 (Phase 4): No dependency on US1 (uses same fusion pipeline independently)
  - US3 (Phase 5): Should come after US1 (needs a fusion to save), but can be built standalone
  - US4 (Phase 6): No dependency on other stories (extends FusionCard image handling)
  - US5 (Phase 7): Should come after US1 (needs a fusion to regenerate)
  - US6 (Phase 8): Can be done at any point but best after US1–US3 for meaningful content to style
- **Phase 9 (Polish)**: Depends on all desired user stories being complete

### Within Each User Story

- Context/state changes before component changes
- Components before page-level wiring
- Core implementation before integration

### Parallel Opportunities

**Phase 1**: T003, T004, T005, T006 can all run in parallel after T001+T002
**Phase 2**: T010, T011, T012, T014, T015, T016, T017 can run in parallel. T019–T022, T025 can run in parallel.
**Phase 3**: T029, T030 can run in parallel
**Phase 4**: T033, T034 can run in parallel
**Phase 5**: T039 can run in parallel with other US3 tasks
**Phase 8**: T048, T049, T050 can run in parallel
**Phase 9**: T051 can run in parallel with other Phase 9 tasks

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (~7 tasks)
2. Complete Phase 2: Foundational (~18 tasks)
3. Complete Phase 3: User Story 1 — Random Fusion (~7 tasks)
4. **STOP and VALIDATE**: Generate a random fusion end-to-end
5. This is a deployable MVP with the core value proposition

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Random Fusion) → **MVP deployed** ✅
3. Add US2 (Manual Selection) → Creative control added
4. Add US3 (Save/Manage) → Persistence & collection
5. Add US4 (AI Images) → Visual enhancement
6. Add US5 (Regenerate) → Replay value
7. Add US6 (Polish) → Production-quality UX
8. Polish phase → Deployment-ready

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [US#] label maps task to specific user story for traceability
- Each user story phase is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
- Tests not included — add test phases if TDD approach is requested later
