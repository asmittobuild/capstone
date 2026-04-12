# API Contracts: Image Generation (SDXL)

**Service**: Custom SDXL API (Optional — local network)
**Base URL**: Configurable via `VITE_SD_API_URL` env var (default: `http://192.168.4.100:8000`)

## Endpoints

### Health Check

```
GET /health
```

- **200**: Service available, proceed with image generation
- **Network error / timeout (2s)**: Service unavailable, use Pokemon logo placeholder (FR-012)

### Generate Fusion Image (Text-to-Image)

Generates a Pokemon-style fusion image from a text prompt using SDXL.

#### Request

```
POST /generate
Content-Type: application/json
```

```json
{
  "prompt": "Pokemon-style creature fusion, digital art, vibrant colors, {fusion_description}, game art, clean lines, white background",
  "negative_prompt": "ugly, deformed, blurry, low quality, worst quality",
  "width": 1024,
  "height": 1024,
  "steps": 30,
  "guidance_scale": 3.0,
  "seed": null
}
```

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `prompt` | string | Yes | — | Fusion description for SDXL |
| `negative_prompt` | string | No | `"ugly, deformed, blurry, low quality, worst quality"` | |
| `width` | int (512–2048) | No | 1024 | SDXL native resolution |
| `height` | int (512–2048) | No | 1024 | SDXL native resolution |
| `steps` | int (1–100) | No | 30 | |
| `guidance_scale` | float (1–20) | No | 3.0 | SDXL CFG scale |
| `seed` | int \| null | No | null | Null for random |

#### Response (200)

```json
{
  "image": "iVBORw0KGgoAAAANSUhEUgAA...",
  "seed": 42
}
```

- `image`: base64-encoded PNG
- `seed`: seed used for generation
- Display as `<img src="data:image/png;base64,{image}" />`

## Error Handling

| Scenario | App Behavior |
|----------|-------------|
| Connection refused / network error | Show placeholder image (FR-012) |
| Timeout (>15s) | Abort, show placeholder image |
| 422 Validation error | Show placeholder image, log error |
| 500 Server error | Show placeholder image |

**Image generation failure must NEVER block or interrupt fusion creation** (Constitution Principle I, FR-020).
