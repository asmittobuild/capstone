# API Contracts: Supabase (Fusion Persistence)

**Service**: Supabase (hosted Postgres) — Required for fusion persistence
**SDK**: `@supabase/supabase-js`
**Connection**: `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)`

## Credentials

| Variable | Source | Example |
|----------|--------|---------|
| `VITE_SUPABASE_URL` | Supabase dashboard → Settings → API → Project URL | `https://abcdefghijk.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API → anon/public key | `eyJhbGciOiJIUzI1NiIs...` |

Stored in `.env` file (not committed). Loaded via Vite's `import.meta.env`.

## Table: `fusions`

```sql
CREATE TABLE fusions (
  id UUID PRIMARY KEY,
  parent1 JSONB NOT NULL,
  parent2 JSONB NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  stats JSONB NOT NULL,
  image_base64 TEXT,
  flavor_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mode TEXT NOT NULL CHECK (mode IN ('random', 'manual'))
);

-- Disable RLS for v1 (single-user, no auth)
ALTER TABLE fusions DISABLE ROW LEVEL SECURITY;
```

## Operations

### List Saved Fusions

```typescript
const { data, error } = await supabase
  .from('fusions')
  .select('*')
  .order('created_at', { ascending: false });
```

**Success**: `data` is `Fusion[]`, `error` is `null`
**Failure**: `data` is `null`, `error.message` describes the issue

### Save a Fusion

```typescript
const { error } = await supabase
  .from('fusions')
  .insert({
    id: fusion.id,
    parent1: fusion.parent1,
    parent2: fusion.parent2,
    name: fusion.name,
    description: fusion.description,
    stats: fusion.stats,
    image_base64: fusion.imageBase64,
    flavor_text: fusion.flavorText,
    created_at: fusion.createdAt,
    mode: fusion.mode,
  });
```

**Success**: `error` is `null`
**Failure**: `error.message` — show toast with retry

### Delete a Fusion

```typescript
const { error } = await supabase
  .from('fusions')
  .delete()
  .eq('id', fusionId);
```

**Success**: `error` is `null`
**Failure**: `error.message` — show toast, refresh collection

## Error Handling

| Scenario | App Behavior |
|----------|-------------|
| Network error / Supabase unreachable | Show DBErrorBanner with retry button (FR-027); retain fusion in memory |
| Insert fails (e.g., duplicate ID) | Show error toast |
| Delete fails (row not found) | Show error toast, refresh collection |
| Missing env vars at build time | App logs warning at init; DB operations fail gracefully |

## Field Mapping (TypeScript → Postgres)

| TypeScript field | Postgres column | Notes |
|-----------------|----------------|-------|
| `id` | `id` | UUID string |
| `parent1` | `parent1` | JSONB — `{ id, name, types }` |
| `parent2` | `parent2` | JSONB — `{ id, name, types }` |
| `name` | `name` | text |
| `description` | `description` | text |
| `stats` | `stats` | JSONB — `{ hp, attack, defense, sp_attack, sp_defense, speed }` (TypeScript uses camelCase: `spAttack`, `spDefense`; mapper converts) |
| `imageBase64` | `image_base64` | text or null (camelCase → snake_case) |
| `flavorText` | `flavor_text` | text or null (camelCase → snake_case) |
| `createdAt` | `created_at` | timestamptz (camelCase → snake_case) |
| `mode` | `mode` | text |
