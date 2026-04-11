# Quickstart: PokeFusions Core

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or pnpm
- Git
- Hugging Face account with API token (free tier works)
- (Optional) Stable Diffusion WebUI running locally on port 7860

## Setup

```bash
# Clone and enter repo
git clone <repo-url>
cd capstone

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Start backend server
cd backend
npm run dev &
cd ..

# Start frontend dev server
npm run dev
```

Frontend runs at `http://localhost:5173` by default. Backend runs at `http://localhost:3001`.

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
| `cd backend && npm run dev` | Start backend API server |

## Project Structure

```
src/
├── components/         # React UI components
├── context/            # React Context providers (fusion, settings)
├── data/               # Bundled pokedex.json
├── hooks/              # Custom hooks (useLocalStorage, useToast)
├── lib/                # Pure logic (fusion mechanics, pokemon utils, sanitize)
├── pages/              # Route-level page components
├── services/           # API clients (HF, PokeAPI, SD, backend)
├── App.tsx             # Root component with routing
└── main.tsx            # Entry point

backend/
├── src/
│   ├── index.ts        # Express entry point with CORS
│   ├── db.ts           # DB client abstraction (provider-agnostic)
│   └── routes/
│       └── fusions.ts  # Fusion CRUD routes
└── package.json

tests/
├── unit/               # Pure logic tests
├── integration/        # Component integration tests
└── setup.ts            # Test configuration
```

## Environment Notes

- **No `.env` file needed**: API token is entered by the user in the Settings UI and stored in localStorage
- **Backend required**: A lightweight backend API persists fusions (including images) to a hosted database. DB technology is TBD — abstracted behind `backend/src/db.ts`.
- **GitHub Pages deployment**: `npm run build` produces static files in `dist/`; Vite `base` is configured for the repo path. Backend is deployed separately.
