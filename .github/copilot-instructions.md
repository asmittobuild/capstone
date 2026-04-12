# capstone Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-12

## Active Technologies
- Supabase (Postgres) for fusion data + images via `@supabase/supabase-js` client SDK; browser localStorage for user settings (API token, model ID, theme). Supabase URL and anon key provided via Vite env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Image generation API URL configurable via `VITE_SD_API_URL` (default `http://192.168.4.100:8000`). (001-pokefusions-core)

- TypeScript 5.x (strict mode) + React 18, Vite 5, Tailwind CSS 3, DOMPurify (XSS sanitization) (001-pokefusions-core)

## Project Structure

```text
src/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.x (strict mode): Follow standard conventions

## Recent Changes
- 001-pokefusions-core: Added TypeScript 5.x (strict mode) + React 18, Vite 5, Tailwind CSS 3, DOMPurify (XSS sanitization)

- 001-pokefusions-core: Added TypeScript 5.x (strict mode) + React 18, Vite 5, Tailwind CSS 3, DOMPurify (XSS sanitization)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
