# Research: PokeFusions Core

**Feature**: 001-pokefusions-core | **Date**: 2026-04-11

## Technology Stack Decisions

### Frontend Framework
- **Decision**: React 18 + TypeScript (strict mode) + Vite 5
- **Rationale**: React is the most widely adopted SPA framework with deep ecosystem support, including React Testing Library for Vitest integration. Vite provides fast HMR and native TypeScript/Tailwind support.
- **Alternatives considered**: Vue 3 (smaller community for this stack); Svelte (less mature testing story); Vanilla JS (too much boilerplate for state management)

### Styling
- **Decision**: Tailwind CSS 3
- **Rationale**: Utility-first approach accelerates prototyping. Dark mode built-in via `dark:` variant. Responsive utilities map directly to FR-018.
- **Alternatives considered**: CSS Modules (more verbose); Styled Components (runtime overhead)

### State Management
- **Decision**: React Context + useReducer
- **Rationale**: App state is simple (current fusion, saved fusions, settings). No need for external state library. Context provides clean provider pattern for fusion state and settings.
- **Alternatives considered**: Zustand (unnecessary for this scope); Redux Toolkit (over-engineered)

### Routing (GitHub Pages)
- **Decision**: React Router v6 with HashRouter
- **Rationale**: GitHub Pages doesn't support server-side URL rewriting. HashRouter works without any 404.html workarounds. URLs like `/#/`, `/#/select`, `/#/collection` are acceptable for a capstone project.
- **Alternatives considered**: BrowserRouter + 404.html redirect (fragile, requires maintenance)
- **Note**: Vite `base` config must be set to `/<repo-name>/` for GitHub Pages deployment

### XSS Sanitization
- **Decision**: DOMPurify with restricted allow-list
- **Rationale**: FR-028 mandates sanitizing all AI-generated text before DOM insertion. DOMPurify is the standard browser-side sanitizer. Configure with restricted `ALLOWED_TAGS` since AI output should only contain basic formatting.
- **Configuration**: Allow only `b`, `i`, `em`, `strong`, `p`, `br` tags. No attributes. No data attributes.

## External API Research

### Hugging Face Chat Completions (Required)
- **Endpoint**: `POST https://router.huggingface.co/v1/chat/completions`
- **Auth**: `Authorization: Bearer hf_****` (user provides token via settings panel)
- **Default Model**: `mistralai/Mistral-7B-Instruct-v0.3`
- **Request**: OpenAI-compatible chat completions format with `model`, `messages[]`, `max_tokens`, `temperature`
- **Response**: `choices[0].message.content` contains generated text
- **Rate limiting**: Returns HTTP 429 with rate-limit headers. App must detect and show cooldown (FR-024).
- **Gotcha**: Model availability can change. The settings panel allows users to override the model ID (FR-029).

### PokeAPI Flavor Text (Optional)
- **Endpoint**: `GET https://pokeapi.co/api/v2/pokemon-species/{id}`
- **Auth**: None required
- **Response**: `flavor_text_entries[]` array with `flavor_text`, `language.name`, `version.name`
- **Strategy**: Filter for `language.name === "en"`, prefer recent game versions (Scarlet, Violet, Sword, Shield). Cache in-memory (Map) to reduce calls.
- **Gotcha**: Flavor text contains `\f` (form feed) and `\n` characters that must be cleaned. Not all Pokemon have entries for all game versions.
- **Fallback**: Skip enrichment silently if API is unreachable (FR-020, Constitution Principle I).

### Stable Diffusion WebUI (Optional)
- **Endpoint**: `POST http://localhost:7860/sdapi/v1/txt2img`
- **Auth**: None (local service)
- **Request**: `{ prompt, negative_prompt, steps, width, height, cfg_scale, seed }`
- **Response**: `{ images: ["base64_encoded_string"] }` — first element is the generated image
- **Prompt strategy**: Pokemon art style prompt engineering (e.g., "Pokemon-style creature, digital art, vibrant colors, [fusion description]")
- **Fallback**: Display Pokemon logo placeholder (FR-012). Detect unavailability via fetch timeout or connection refused.
- **Gotcha**: Images are NOT persisted in localStorage (FR-026). They're displayed inline as `data:image/png;base64,...` and regenerated on demand.

## localStorage Strategy

### Quota Management
- **Modern API**: `navigator.storage.estimate()` provides `usage` and `quota` for total origin storage
- **Fallback**: Try-catch on `setItem()` — catches `QuotaExceededError` when storage is full
- **Typical limit**: ~5–10MB per origin across browsers
- **Budget**: With text-only fusions (no images per FR-026), each saved fusion is ~1–2KB. Budget supports 2,500+ saved fusions comfortably.
- **Warning threshold**: Alert user at ~80% capacity (FR-027). Block saves at capacity with informative message.

### Data Schema (localStorage keys)
- `pokefusions_saved`: JSON array of saved fusion objects
- `pokefusions_settings`: JSON object with `apiToken`, `modelId`, `theme`

## Pokemon Dataset

- **Source**: Bundled static `pokedex.json` (809 species, Gens 1–7, ending at Melmetal)
- **Fields per Pokemon**: `id`, `name`, `types[]`, `stats{}` (hp, attack, defense, sp_attack, sp_defense, speed)
- **No runtime fetching**: Dataset is imported at build time, tree-shaken into the bundle
- **Type compatibility matrix**: Pairs excluded only if both Pokemon share the exact same type combination. Implemented as a simple comparison function, not a precomputed matrix.
