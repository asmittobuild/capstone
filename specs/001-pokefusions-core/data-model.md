# Data Model: PokeFusions Core

**Feature**: 001-pokefusions-core | **Date**: 2026-04-11

## Entities

### Pokemon

Source: Bundled `pokedex.json` (read-only, 809 entries)

| Field | Type | Description |
|-------|------|-------------|
| id | number | National Pokedex number (1–809) |
| name | string | Species name (lowercase, e.g., "bulbasaur") |
| types | string[] | 1–2 type names (e.g., ["grass", "poison"]) |
| stats | PokemonStats | Six base stat values |

#### PokemonStats

| Field | Type | Description |
|-------|------|-------------|
| hp | number | Hit Points |
| attack | number | Physical Attack |
| defense | number | Physical Defense |
| sp_attack | number | Special Attack |
| sp_defense | number | Special Defense |
| speed | number | Speed |

**Validation**: All stat values are positive integers. Types array has 1 or 2 elements.

---

### Fusion

Generated at runtime, optionally persisted to localStorage.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (UUID v4, generated at creation) |
| parent1 | FusionParent | First parent Pokemon reference |
| parent2 | FusionParent | Second parent Pokemon reference |
| name | string | AI-generated blended fusion name |
| description | string | AI-generated descriptive text |
| stats | PokemonStats | Averaged stats from both parents (rounded to integers) |
| imageBase64 | string \| null | AI-generated image (persisted to hosted DB when available) |
| flavorText | string \| null | Optional PokeAPI flavor text enrichment |
| createdAt | string | ISO 8601 timestamp |
| mode | "random" \| "manual" | How the pair was selected |

#### FusionParent

| Field | Type | Description |
|-------|------|-------------|
| id | number | National Pokedex number |
| name | string | Species name |
| types | string[] | Type array |

**Validation**:
- `parent1.id !== parent2.id` (cannot fuse a Pokemon with itself)
- `name` and `description` must be sanitized via DOMPurify before rendering
- `stats` values are `Math.round((parent1.stat + parent2.stat) / 2)` for each of the six stats

**State Transitions**:
- **Generated** → Initial state after AI returns results (in-memory only)
- **Saved** → User explicitly saves to hosted DB (all fields including imageBase64 when present)
- **Regenerated** → User triggers regeneration; `name`, `description`, `imageBase64` are replaced; `id` stays the same; if previously saved, requires explicit re-save

---

### Settings

Persisted to localStorage under `pokefusions_settings`.

| Field | Type | Description |
|-------|------|-------------|
| apiToken | string \| null | Hugging Face API bearer token |
| modelId | string | HF model identifier (default: "mistralai/Mistral-7B-Instruct-v0.3") |
| theme | "light" \| "dark" \| "system" | UI theme preference |

**Validation**:
- `apiToken` must be non-empty string before fusion generation is allowed (FR-023)
- `modelId` must be non-empty string; falls back to default if cleared

## Relationships

```
Pokemon (809 entries, read-only)
  ├── referenced by FusionParent.id (lookup)
  └── used for type compatibility check

Fusion (0..N, user-generated)
  ├── parent1 → Pokemon (by id)
  ├── parent2 → Pokemon (by id)
  └── persisted in hosted DB (all fields including image)

Settings (singleton)
  └── persisted in localStorage (browser-local)
```

## Storage Schema

### Hosted Database (fusion data)

| Collection/Table | Document/Row Shape | Description |
|------------------|--------------------|-------------|
| `fusions` | Fusion object (all fields) | Saved fusions with images as base64 strings or binary blobs (DB-dependent) |

### localStorage (user settings only)

| Key | Type | Description |
|-----|------|-------------|
| `pokefusions_settings` | Settings (JSON) | API token, model ID, theme preference |

**Storage budget**: No practical limit for fusion count — hosted DB handles capacity. Images stored as base64 strings (~500KB–1MB each) or binary blobs depending on DB choice.
