# Tasks: PokeFusions Core

**Input**: Design documents from `/specs/001-pokefusions-core/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Required per FR-032 and FR-033. Unit tests for src/lib/ (pure functions) and integration tests for src/services/ (mocked APIs) + orchestrator. Coverage target: ≥80% line coverage on src/lib/ and src/services/ (SC-009).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and base configuration

- [x] T001 Initialize Vite + React + TypeScript project with `npm create vite@latest` in repository root
- [x] T002 Install core dependencies: react-router-dom, dompurify, @types/dompurify, uuid, @types/uuid, @supabase/supabase-js
- [x] T003 [P] Configure Tailwind CSS 3 with dark mode class strategy in tailwind.config.ts and src/index.css
- [x] T004 [P] Configure Vitest and React Testing Library with coverage thresholds (≥80% on src/lib/ and src/services/) in vite.config.ts and tests/setup.ts
- [x] T005 [P] Configure ESLint and Prettier for TypeScript + React in .eslintrc.cjs and .prettierrc
- [x] T006 [P] Configure Vite for GitHub Pages deployment with correct base path in vite.config.ts
- [x] T007 Create base TypeScript types for Pokemon, PokemonStats, Fusion, FusionParent, and Settings in src/types.ts
- [x] T008 [P] Create .env.example with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_SD_API_URL placeholders, and add .env to .gitignore
- [x] T008b Create `fusions` table in Supabase project using SQL DDL from contracts/supabase.md (manual step via Supabase SQL Editor)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data layer, service clients, Supabase integration, and shared UI primitives that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Add bundled Pokemon dataset (809 species, Gens 1–7) as src/data/pokedex.json
- [x] T010 Implement Pokemon data access module with getAll, getById, getByName, and getTypes utilities in src/lib/pokemon.ts
- [x] T011 [P] Implement DOMPurify sanitization wrapper with restricted allow-list (b, i, em, strong, p, br) in src/lib/sanitize.ts
- [x] T012 [P] Implement deterministic stat averaging function (Math.round per stat) in src/lib/fusion.ts
- [x] T013 [P] Implement type-compatibility check function (exclude pairs with identical type combinations) in src/lib/fusion.ts
- [x] T014 Implement Hugging Face chat completions client with auth, request/response parsing, rate-limit detection (HTTP 429 + Retry-After header), automatic retry-once on empty or malformed AI responses, and error handling in src/services/huggingface.ts
- [x] T015 [P] Implement PokeAPI flavor text client with language filtering, version preference, in-memory caching, and silent fallback in src/services/pokeapi.ts
- [x] T016 [P] Implement SDXL image generation client with `GET /health` availability probe, `POST /generate` text-to-image request (1024×1024, guidance_scale 3.0), base64 response handling (`{ image, seed }`), configurable base URL via `VITE_SD_API_URL`, and silent fallback in src/services/stablediffusion.ts (per contracts/stablediffusion-api.md)
- [x] T017 [P] Implement useLocalStorage custom hook for typed get/set with JSON serialization in src/hooks/useLocalStorage.ts (used for settings only: API token, model ID, theme)
- [x] T018 [P] Implement useToast custom hook for toast notification state management (success, error, info with 3s auto-dismiss) in src/hooks/useToast.ts
- [x] T019 Implement SettingsContext provider with apiToken, modelId, theme state (light/dark/system), localStorage persistence, first-run detection, and dark mode class-based switching on document root in src/context/SettingsContext.tsx
- [x] T020 [P] Create Toast notification component with auto-dismiss animation and success/error/info variants in src/components/ui/Toast.tsx
- [x] T021 [P] Create SkeletonCard loading placeholder component with shimmer animation in src/components/ui/SkeletonCard.tsx
- [x] T022 [P] Create Button component with loading, disabled, and variant states in src/components/ui/Button.tsx
- [x] T023 [P] Create TypeBadge component for Pokemon type display with type-specific colors in src/components/ui/TypeBadge.tsx
- [x] T024 Set up HashRouter with routes for home (/), select (/select), collection (/collection), and settings (/settings) in src/App.tsx
- [x] T025 Create main entry point mounting App with SettingsContext provider in src/main.tsx
- [x] T026 Initialize Supabase client using createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY) and implement provider-agnostic wrapper with save, list, delete operations, camelCase↔snake_case field mapping, error handling, and retry on network failure in src/services/db.ts (per contracts/supabase.md)
- [x] T027 [P] Create DBErrorBanner component that appears when Supabase is unreachable, with informative message and retry button (FR-027) in src/components/ui/DBErrorBanner.tsx

**Checkpoint**: Foundation ready — all shared services, Supabase client, utilities, types, and UI primitives are in place. User story implementation can now begin.

---

## Phase 2b: Automated Tests (FR-032, FR-033)

**Purpose**: Unit tests for all pure functions in src/lib/ and integration tests for all service clients in src/services/ with mocked APIs. Validates deterministic core without AI dependency (Constitution Principle IV).

**⚠️ TIMING**: Tests should be written alongside or immediately after their implementation targets in Phase 2. They can also be written after user story phases as a test-after pass.

### Unit Tests (FR-032) — src/lib/

- [ ] T057 [P] Write unit tests for stat averaging function: verify Math.round per stat, symmetric inputs, zero stats, max stats in tests/unit/fusion.test.ts
- [ ] T058 [P] Write unit tests for type-compatibility check: identical single-type, identical dual-type, different types, partial overlap in tests/unit/fusion.test.ts
- [ ] T059 [P] Write unit tests for AI response parser: valid response extraction, fallback name generation, empty response, malformed JSON in tests/unit/fusion.test.ts
- [ ] T060 [P] Write unit tests for Pokemon data access: getById (valid/invalid), getByName (case-insensitive), getAll count, getTypes in tests/unit/pokemon.test.ts
- [ ] T061 [P] Write unit tests for DOMPurify sanitization wrapper: strips script tags, preserves allowed tags (b, i, em, strong, p, br), strips attributes, handles empty/null input in tests/unit/sanitize.test.ts

### Integration Tests (FR-032) — src/services/

- [ ] T062 [P] Write integration tests for Hugging Face client: auth header construction, request body format, successful response parsing, 429 rate-limit detection with Retry-After header, retry-once on empty response, timeout handling in tests/integration/huggingface.test.ts
- [ ] T063 [P] Write integration tests for PokeAPI client: flavor text extraction with language filtering, version preference, in-memory cache hit/miss, silent fallback on network error in tests/integration/pokeapi.test.ts
- [ ] T064 [P] Write integration tests for SDXL client: health probe success/failure, generate request with correct parameters, base64 response handling, silent fallback on timeout/error in tests/integration/stablediffusion.test.ts
- [ ] T065 [P] Write integration tests for Supabase DB wrapper: save with camelCase↔snake_case mapping, list with descending order, delete by ID, error handling, retry on network failure in tests/integration/db.test.ts

### Orchestrator Integration Tests (FR-033)

- [ ] T066 Write integration tests for fusion generation orchestrator: full pipeline with all services mocked (random pair → stats → HF text → PokeAPI flavor → SDXL image → assembled Fusion), graceful degradation when optional services unavailable, timeout enforcement in tests/integration/orchestrator.test.ts

**Checkpoint**: All unit and integration tests pass. Coverage meets ≥80% on src/lib/ and src/services/.

---

## Phase 3: User Story 1 — Generate a Random Fusion (Priority: P1) 🎯 MVP

**Goal**: User clicks "Generate Fusion" and sees a fusion card with AI-generated name, description, averaged stats, and optional image for a randomly selected compatible pair.

**Independent Test**: Click "Generate" on the home page → loading skeleton appears → fusion card displays with blended name, averaged stats, AI description, and image/placeholder.

### Implementation for User Story 1

- [ ] T028 [US1] Implement fusion generation orchestrator: random pair selection → stat averaging → HF text generation (max 12s timeout) → optional PokeAPI flavor text (max 3s, abort if slower) → optional SD image (non-blocking, max 15s) → assemble Fusion object. Total text-generation path must complete within 15s per SC-001. In src/lib/fusion.ts
- [ ] T029 [US1] Implement AI response parser to extract fusion name and description from HF chat completion content with fallback name generation in src/lib/fusion.ts
- [ ] T030 [US1] Implement FusionContext provider with current fusion state, generate action, loading/error states, rate-limit cooldown timer (parse Retry-After / X-RateLimit-Reset headers), and Generate button disable/re-enable logic (FR-024) in src/context/FusionContext.tsx
- [ ] T031 [P] [US1] Create FusionCard component displaying fusion name, parent names with TypeBadges, six color-coded stats (green/yellow/red by value) with total, sanitized AI description, image or Pokemon logo placeholder, creation timestamp, and action buttons in src/components/FusionCard/FusionCard.tsx
- [ ] T032 [P] [US1] Create StatBar sub-component with color coding (green ≥100, yellow ≥50, red <50) and value display in src/components/FusionCard/StatBar.tsx
- [ ] T033 [US1] Create HomePage with "Generate Fusion" button, API token check gate (FR-023), loading skeleton, error state with retry, rate-limit cooldown display, and fusion card output in src/pages/HomePage.tsx
- [ ] T034 [US1] Wire FusionContext provider into App.tsx wrapping all routes in src/App.tsx

**Checkpoint**: User Story 1 is complete. User can generate random fusions with one click. This is the MVP.

---

## Phase 4: User Story 2 — Select Two Pokemon Manually (Priority: P2)

**Goal**: User browses/searches the full Pokemon roster, picks two specific Pokemon, and generates a fusion for that pair.

**Independent Test**: Navigate to /select → browse/search roster → pick two different Pokemon → click "Fuse" → fusion card appears with correct parents.

### Implementation for User Story 2

- [ ] T035 [P] [US2] Create PokemonSelector component with searchable/filterable virtualized grid of 809 Pokemon (virtualization or lazy loading for performance) showing name, sprite placeholder, and types in src/components/PokemonSelector/PokemonSelector.tsx
- [ ] T036 [P] [US2] Create PokemonCard mini-component for each selectable Pokemon entry in the grid in src/components/PokemonSelector/PokemonCard.tsx
- [ ] T037 [US2] Implement manual fusion generation flow in FusionContext: accept two specific Pokemon IDs, validate different Pokemon (FR-003), generate fusion same pipeline as random in src/context/FusionContext.tsx
- [ ] T038 [US2] Create SelectPage with two selection slots, same-Pokemon validation message, search/filter bar, "Fuse" button, and fusion card output in src/pages/SelectPage.tsx

**Checkpoint**: User Stories 1 and 2 are both functional. Users can generate fusions randomly or by manual selection.

---

## Phase 5: User Story 3 — Save and Manage Fusions (Priority: P3)

**Goal**: User saves generated fusions (including images) to Supabase, browses their collection, and deletes fusions they don't want.

**Independent Test**: Generate a fusion → click "Save" → toast confirms → navigate to /collection → fusion is displayed → close browser → reopen → fusion persists across sessions and devices → click "Delete" → fusion removed.

### Implementation for User Story 3

- [ ] T039 [US3] Implement saved fusions state management in FusionContext: save via Supabase client (all fields including imageBase64 per FR-026), load collection from Supabase, delete from Supabase, show DBErrorBanner when Supabase is unreachable, and retain current fusion in memory for retry (FR-027) in src/context/FusionContext.tsx
- [ ] T040 [US3] Add Save and Delete action buttons to FusionCard with appropriate visibility (Save when unsaved, Delete when viewing collection) in src/components/FusionCard/FusionCard.tsx
- [ ] T041 [P] [US3] Create Collection component displaying saved fusions as a grid of FusionCards, with an empty state component showing guidance message when no fusions are saved, in src/components/Collection/Collection.tsx and src/components/Collection/EmptyState.tsx
- [ ] T042 [US3] Create CollectionPage with Collection component, empty state with guidance, and navigation in src/pages/CollectionPage.tsx

**Checkpoint**: User Stories 1–3 are functional. Core experience is complete: generate, view, save, browse, delete.

---

## Phase 6: User Story 4 — View AI-Generated Fusion Image (Priority: P4)

**Goal**: When the SDXL image generation service is available, fusion cards show an AI-generated Pokemon-style image. When unavailable, a Pokemon logo placeholder is shown.

**Independent Test**: Generate a fusion with SD running → image appears on card. Stop SD → generate again → placeholder appears with no error.

### Implementation for User Story 4

- [ ] T043 [US4] Implement image generation integration in the fusion orchestrator: probe SDXL API via `GET /health`, call `POST /generate` with fusion description prompt, attach base64 image to Fusion, fall back to null silently in src/lib/fusion.ts
- [ ] T044 [US4] Add Pokemon logo placeholder asset as src/assets/pokemon-logo.png
- [ ] T045 [US4] Update FusionCard to display imageBase64 as inline image when present, or Pokemon logo placeholder when null, with smooth fade-in transition in src/components/FusionCard/FusionCard.tsx

**Checkpoint**: User Stories 1–4 are functional. Fusions show AI images when available, placeholder when not.

---

## Phase 7: User Story 5 — Regenerate a Fusion (Priority: P5)

**Goal**: User clicks "Regenerate" on a fusion card to get a new AI-generated name and description for the same parent pair without re-selecting.

**Independent Test**: Generate a fusion → note the name/description → click "Regenerate" → loading state appears → name and description change, parents stay the same.

### Implementation for User Story 5

- [ ] T046 [US5] Implement regenerate action in FusionContext: same parent pair, new HF text generation call, replace name/description/image on current fusion, preserve ID and createdAt in src/context/FusionContext.tsx
- [ ] T047 [US5] Add Regenerate button to FusionCard with loading state during regeneration and visual indicator that re-save is needed if previously saved in src/components/FusionCard/FusionCard.tsx

**Checkpoint**: User Stories 1–5 are functional. Full generation lifecycle: create, view, save, regenerate, delete.

---

## Phase 8: User Story 6 — Polished Responsive Experience (Priority: P6)

**Goal**: The app provides a polished experience with dark mode, responsive layout, smooth animations, and clear feedback for all states.

**Independent Test**: Use app on mobile and desktop viewports → toggle dark mode → verify all states (loading, error, empty, success) render correctly with transitions.

### Implementation for User Story 6

- [ ] T048 [US6] Create Settings page with API token input, model ID input with default value, and theme toggle (light/dark/system) in src/pages/SettingsPage.tsx
- [ ] T049 [US6] Implement system theme preference detection (prefers-color-scheme media query) and theme toggle UI refinement (light/dark/system selector) in src/context/SettingsContext.tsx
- [ ] T050 [P] [US6] Add responsive layout and navigation (navbar with route links, mobile hamburger menu) in src/App.tsx
- [ ] T051 [P] [US6] Add Tailwind responsive utilities to all page layouts for 320px–2560px viewport range in src/pages/HomePage.tsx, src/pages/SelectPage.tsx, src/pages/CollectionPage.tsx
- [ ] T052 [P] [US6] Add CSS transitions and animations for card appearance, theme switching, toast enter/exit, and skeleton shimmer in src/index.css

**Checkpoint**: All 6 user stories are complete. Full polished experience across devices.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final polish, validation, and deployment readiness

- [ ] T053 [P] Configure GitHub Pages deployment workflow with Supabase env vars as repository secrets in .github/workflows/deploy.yml
- [ ] T054 Validate all AI-generated text passes through DOMPurify sanitization — audit every render path for unsanitized content (FR-028)
- [ ] T055 Run quickstart.md validation: fresh clone, copy .env.example to .env with Supabase credentials, install, dev server, generate fusion, save to Supabase, reload, verify persistence across sessions
- [ ] T056 Final build verification: npm run build succeeds, preview serves correctly, no console errors
- [ ] T067 Run `npm run test:coverage` and verify ≥80% line coverage on src/lib/ and src/services/ directories per SC-009

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (project must be initialized)
- **Phase 2b (Tests)**: Depends on Phase 2 (tests target src/lib/ and src/services/ implementations). Can also be deferred and written incrementally alongside user story phases.
- **Phase 3–8 (User Stories)**: All depend on Phase 2 (foundational must be complete, including Supabase client)
  - US1 (Phase 3): No dependency on other stories — **this is the MVP**
  - US2 (Phase 4): No dependency on US1 (uses same fusion pipeline independently)
  - US3 (Phase 5): Should come after US1 (needs a fusion to save), but can be built standalone. Requires Supabase client (T026) from Phase 2.
  - US4 (Phase 6): No dependency on other stories (extends FusionCard image handling)
  - US5 (Phase 7): Should come after US1 (needs a fusion to regenerate)
  - US6 (Phase 8): Can be done at any point but best after US1–US3 for meaningful content to style
- **Phase 9 (Polish)**: Depends on all desired user stories being complete and Phase 2b tests passing

### Within Each User Story

- Context/state changes before component changes
- Components before page-level wiring
- Core implementation before integration

### Parallel Opportunities

**Phase 1**: T003, T004, T005, T006, T008 can all run in parallel after T001+T002
**Phase 2**: T011, T012, T013, T015, T016, T017, T018 can run in parallel. T020–T023, T027 can run in parallel.
**Phase 3**: T031, T032 can run in parallel
**Phase 4**: T035, T036 can run in parallel
**Phase 5**: T041 can run in parallel with other US3 tasks
**Phase 2b**: T057–T061 can all run in parallel. T062–T065 can all run in parallel. T066 depends on T062–T065 (uses same mocking patterns).
**Phase 8**: T050, T051, T052 can run in parallel
