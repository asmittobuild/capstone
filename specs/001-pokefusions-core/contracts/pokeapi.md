# API Contracts: PokeAPI Flavor Text

**Service**: PokeAPI (Optional — graceful fallback)
**Base URL**: `https://pokeapi.co/api/v2`

## Get Pokemon Flavor Text

Fetches species flavor text to enrich fusion descriptions.

### Request

```
GET /pokemon-species/{id}
```

No authentication required. No request body.

### Response (Success — 200)

```json
{
  "id": 1,
  "name": "bulbasaur",
  "flavor_text_entries": [
    {
      "flavor_text": "A strange seed was\nplanted on its\nback at birth.\fThe plant sprouts\nand grows with\nthis POKéMON.",
      "language": { "name": "en", "url": "..." },
      "version": { "name": "red", "url": "..." }
    }
  ]
}
```

### Response Parsing

1. Filter `flavor_text_entries` where `language.name === "en"`
2. Prefer entries from recent game versions: `scarlet`, `violet`, `sword`, `shield` (in order)
3. Fall back to any English entry if preferred versions not found
4. Clean `flavor_text`: replace `\f` (form feed) and `\n` with spaces, collapse multiple spaces

### Caching Strategy

- Cache in-memory (`Map<number, string>`) keyed by Pokemon ID
- Cache populated on first fetch per session
- No localStorage persistence for flavor text (ephemeral)

### Error Handling

| Scenario | App Behavior |
|----------|-------------|
| 404 (unknown species) | Skip flavor text, continue fusion |
| Network error | Skip flavor text silently (FR-020) |
| Timeout (>3s) | Abort, skip flavor text silently |

**The app must NEVER block fusion generation due to PokeAPI failure** (Constitution Principle I).
