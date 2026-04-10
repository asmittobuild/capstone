# PokeFusions — App Summary

## Concept

An AI-powered Pokemon fusion generator. It takes two random (or handpicked) Pokemon, blends them into a new "fusion" concept with a creative name, merged stats, and AI-written descriptions.

---

## Features

### Core Generation
- User can generate one fusion with randomly selected compatible Pokemon pairs (type-compatibility filter applied)
- For each fusion, AI generates: a blended name and unique descriptions
- Stats are averaged from both parents across all 6 stat types
- User can also select any 2 pokemon and the app will generate the fusion as well.
- user can save the fusion generated to see it later
- Optional: AI generates a Pokemon-style image


### Fusion Card
- Fusion name + parent Pokemon names with type badges
- All 6 stats with color coding (green/yellow/red by value) + total
- AI-written descriptions
- AI-generated image (if available)
- Creation timestamp
- Save/Delete/Regenerate buttons

### UX
- Loading skeleton cards during generation
- Toast notifications (success/error/info, auto-dismiss 3s)
- Error state with retry button
- Dark mode support
- Responsive/mobile layout
- Smooth animations

---

## External API Integrations

| Service | Purpose | Required? |
|---|---|---|
| Hugging Face (`router.huggingface.co`) | Generate fusion name + descriptions | Yes |
| PokeAPI (`pokeapi.co`) | Fetch flavor text for parent Pokemon | No (has fallback) |
| Stable Diffusion WebUI (`localhost:7860`) | Generate fusion images | No (optional) |

**Hugging Face:** Uses the OpenAI-compatible chat completions endpoint. Supports multiple model/provider options. Auth via bearer token.

**PokeAPI:** Fetches Pokemon flavor text/lore descriptions. Prefers recent game versions (Scarlet, Violet, Sword, Shield). Results are cached in-memory to reduce calls. Graceful fallback if unavailable.

**Stable Diffusion WebUI:** Local instance for image generation. Prompt-engineered for Pokemon art style. Returns base64-encoded images. App works fully without it.

---

## Data

- **809 Pokemon** across Gens 1–7 (ends at Melmetal) sourced from a pokedex.json file? is there a way we can have ALL pokemon?
- Type compatibility filter prevents nonsensical pairings (still possible in manual mode)
- Stats (6 types) are averaged from both parent Pokemon

---

## Constraints / Design Decisions

- Image generation is fully optional — app works without it - use the pokemon logo when no image is generated
- how do we handle persistence?
- Local-only to start; explore possible deployment? (image generation will be hosted on a home pc so it wont be accessible if deployed)


## How this will be developed?

- Github copilot using sonnet
- speck kit with a twist:
    - everything will be speced using spec kit and then stories created on github issues
    - 'implement' should pickup issues and operate accordingly
- subagents are encouraged
- mcp for github

