# Implementation Plan: PokeFusions Core

**Branch**: `001-pokefusions-core` | **Date**: 2026-04-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-pokefusions-core/spec.md`

## Summary

AI-powered Pokemon fusion generator — a React SPA that lets users fuse two Pokemon (random or manual selection) into a unique creation with AI-generated names/descriptions, averaged stats, and optional AI images. Built with React + TypeScript + Vite + Tailwind CSS, persisting fusions to Supabase, deployed to GitHub Pages. Hugging Face inference API provides the AI text generation; PokeAPI and a custom SDXL image generation API are optional integrations.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: React 18, Vite 5, Tailwind CSS 3, DOMPurify (XSS sanitization)
**Storage**: Supabase (Postgres) for fusion data + images via `@supabase/supabase-js` client SDK; browser localStorage for user settings (API token, model ID, theme). Supabase URL and anon key provided via Vite env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Image generation API URL configurable via `VITE_SD_API_URL` (default `http://192.168.4.100:8000`).
**Testing**: Vitest + React Testing Library
**Target Platform**: Modern browsers (latest 2 versions of Chrome, Firefox, Safari, Edge); deployed to GitHub Pages
**Project Type**: Single-page web application (SPA)
**Performance Goals**: Fusion generation ≤15s end-to-end (per SC-001); UI feedback within 1s of user action (per SC-004); 60fps animations
**Constraints**: localStorage for settings only; hosted DB required for fusion persistence; no offline mode; single-user (no auth for v1)
**Scale/Scope**: 809 Pokemon (bundled JSON), single user, ~6 main views/states (home, selection, fusion card, collection, settings, empty states)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Graceful Degradation | PASS | Design separates required (HF text) from optional (PokeAPI, SDXL image API) services. FR-020 mandates silent failure for optional services. FR-012 defines image placeholder fallback. FR-016 requires error+retry for required service failures. |
| II | Cloud-Persisted Architecture | PASS | Saved fusions (with images) persisted to Supabase via `@supabase/supabase-js` client SDK (FR-009, FR-026). Credentials via env vars. User settings remain in localStorage (FR-022). No user accounts for v1. No backend server — SPA connects directly to Supabase. |
| III | Spec-Driven Workflow | PASS | This plan is generated from spec.md via `/speckit.plan`. Implementation will follow the full Spec Kit pipeline through tasks and issues. |
| IV | Deterministic Core, AI-Augmented Surface | PASS | Stat averaging (FR-006), type compatibility filtering (FR-002), and Pokemon data lookup are deterministic. AI generates only names (FR-004), descriptions (FR-005), and optional images (FR-013) — all on the surface layer. |
| V | Responsive & Accessible UX | PASS | FR-014 (skeletons), FR-015 (toasts), FR-016 (error+retry), FR-017 (dark mode), FR-018 (responsive), FR-019 (animations) all specified. SC-005 defines viewport range 320px–2560px. |

**Gate Result**: ALL PASS — proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/           # React UI components
│   ├── FusionCard/       # Fusion card display (stats, image, actions)
│   ├── PokemonSelector/  # Manual Pokemon selection UI
│   ├── Collection/       # Saved fusions gallery
│   └── ui/               # Shared UI primitives (Toast, Skeleton, Button, Badge)
├── data/
│   └── pokedex.json      # Bundled 809 Pokemon dataset
├── hooks/                # Custom React hooks (useLocalStorage, useToast)
├── lib/                  # Pure logic (no React dependency)
│   ├── fusion.ts         # Deterministic fusion mechanics (stats, names, compatibility)
│   ├── pokemon.ts        # Pokemon data access & type utilities
│   └── sanitize.ts       # DOMPurify wrapper for AI output
├── services/             # External API integrations
│   ├── huggingface.ts    # HF chat completions client (required)
│   ├── pokeapi.ts        # PokeAPI flavor text client (optional)
│   ├── stablediffusion.ts # Custom SDXL image generation client (optional)
│   └── db.ts             # Supabase client SDK wrapper (save/load/delete fusions)
├── context/              # React Context providers
│   ├── FusionContext.tsx  # Fusion state management
│   └── SettingsContext.tsx # API token, model ID, theme
├── pages/                # Top-level route views
│   ├── HomePage.tsx       # Random fusion generation
│   ├── SelectPage.tsx     # Manual Pokemon selection
│   └── CollectionPage.tsx # Saved fusions browsing
├── App.tsx               # Root component, routing, providers
├── main.tsx              # Entry point
└── index.css             # Tailwind directives + global styles

tests/
├── unit/                 # Pure logic tests (fusion, pokemon, sanitize)
├── integration/          # Component + service integration tests
└── setup.ts              # Vitest setup (MSW, mocks)
```

**Structure Decision**: Single-page application. Frontend under `src/` with clear separation between deterministic logic (`lib/`), React components (`components/`), external integrations (`services/`), and state management (`context/`). Supabase is accessed directly via `@supabase/supabase-js` in `services/db.ts` — no custom backend server. Credentials come from Vite env vars (`.env` file, not committed). Tests mirror the `lib/` and `components/` structure.

## Complexity Tracking

No constitution violations identified. All principles pass cleanly with this design.
