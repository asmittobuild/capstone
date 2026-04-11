# API Contracts: Backend Fusion API

**Service**: PokeFusions Backend API (Required for persistence)
**Base URL**: TBD (e.g., `http://localhost:3001/api` in development)

## List Saved Fusions

### Request

```
GET /fusions
```

### Response (Success — 200)

```json
[
  {
    "id": "uuid-v4",
    "parent1": { "id": 1, "name": "bulbasaur", "types": ["grass", "poison"] },
    "parent2": { "id": 4, "name": "charmander", "types": ["fire"] },
    "name": "Bulbamander",
    "description": "A fiery creature with a smoldering bulb...",
    "stats": { "hp": 55, "attack": 60, "defense": 55, "sp_attack": 72, "sp_defense": 55, "speed": 57 },
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "flavorText": "A seed Pokemon with a fiery temperament.",
    "createdAt": "2026-04-11T12:00:00.000Z",
    "mode": "random"
  }
]
```

---

## Save a Fusion

### Request

```
POST /fusions
Content-Type: application/json
```

```json
{
  "id": "uuid-v4",
  "parent1": { "id": 1, "name": "bulbasaur", "types": ["grass", "poison"] },
  "parent2": { "id": 4, "name": "charmander", "types": ["fire"] },
  "name": "Bulbamander",
  "description": "A fiery creature with a smoldering bulb...",
  "stats": { "hp": 55, "attack": 60, "defense": 55, "sp_attack": 72, "sp_defense": 55, "speed": 57 },
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "flavorText": "A seed Pokemon with a fiery temperament.",
  "createdAt": "2026-04-11T12:00:00.000Z",
  "mode": "random"
}
```

### Response (Success — 201)

```json
{
  "id": "uuid-v4",
  "saved": true
}
```

---

## Delete a Fusion

### Request

```
DELETE /fusions/{id}
```

### Response (Success — 200)

```json
{
  "id": "uuid-v4",
  "deleted": true
}
```

---

## Update a Fusion (Regeneration re-save)

### Request

```
PUT /fusions/{id}
Content-Type: application/json
```

Body: Full Fusion object (same shape as POST).

### Response (Success — 200)

```json
{
  "id": "uuid-v4",
  "updated": true
}
```

---

## Error Responses

| Status | Meaning | App Behavior |
|--------|---------|-------------|
| 400 | Invalid request body | Show validation error toast |
| 404 | Fusion not found (delete/update) | Show error toast, refresh collection |
| 500+ | Server/DB error | Show error with retry button (FR-027) |
| Network error | Backend unreachable | Show error with retry; retain fusion in memory |

**The frontend MUST retain the current fusion in memory when the backend is unreachable** so the user can retry saving without regenerating (Constitution Principle I + FR-027).

## Implementation Notes

- The backend is a lightweight API layer; no business logic beyond CRUD
- Database technology is TBD — the `db.ts` module abstracts the provider
- Image data (`imageBase64`) is stored as a string field; DB-specific optimizations (e.g., S3 for images with DynamoDB, GridFS with MongoDB) can be added later
- No authentication for v1 — all requests are unauthenticated
- CORS must be configured to allow the frontend origin
