# Quickstart: PokeFusions Core

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or pnpm
- Git
- Hugging Face account with API token (free tier works)
- Supabase account with a project (free tier works) — get project URL and anon key from Settings > API
- (Optional) Custom SDXL image generation API running (default: `http://192.168.4.100:8000`)

## Setup

```bash
# Clone and enter repo
git clone <repo-url>
cd capstone

# Copy env template and fill in Supabase credentials
cp .env.example .env
# Edit .env with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Create the fusions table in Supabase SQL Editor
# Run the DDL from specs/001-pokefusions-core/contracts/supabase.md

# Install dependencies
npm install

# Start dev server
npm run dev
```

App runs at `http://localhost:5173` by default.

## Configuration

1. Open the app in your browser
2. Navigate to Settings (gear icon)
3. Enter your Hugging Face API token
4. (Optional) Change the model ID from the default (`mistralai/Mistral-7B-Instruct-v0.3`)
5. Click Save

## First Fusion

1. Click "Generate Fusion" on the home page
2. Wait for AI to generate name + description (~5–15s)
3. View the fusion card with blended stats, name, and description
4. Click "Save" to add it to your collection

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run Vitest unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── components/         # React UI components
├── context/            # React Context providers (fusion, settings)
├── data/               # Bundled pokedex.json
├── hooks/              # Custom hooks (useLocalStorage, useToast)
├── lib/                # Pure logic (fusion mechanics, pokemon utils, sanitize)
├── pages/              # Route-level page components
├── services/           # API clients (HF, PokeAPI, SD, hosted DB)
├── App.tsx             # Root component with routing
└── main.tsx            # Entry point

tests/
├── unit/               # Pure logic tests
├── integration/        # Component integration tests
└── setup.ts            # Test configuration
```

## Environment Notes

- **`.env` file required for Supabase**: Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key. These are loaded at build time via Vite's `import.meta.env`.
- **`VITE_SD_API_URL` (optional)**: Set to your image generation API URL if not using the default (`http://192.168.4.100:8000`).
- **HF API token**: Entered by the user in the Settings UI and stored in localStorage (not in `.env`)
- **No backend server**: The app connects directly to Supabase via `@supabase/supabase-js` client SDK.
- **GitHub Pages deployment**: `npm run build` produces static files in `dist/`; Vite `base` is configured for the repo path. Supabase env vars must be set in the deployment environment.
