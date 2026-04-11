# API Contracts: Stable Diffusion WebUI

**Service**: Stable Diffusion WebUI API (Optional — local only)
**Base URL**: `http://localhost:7860`

## Generate Fusion Image

Generates a Pokemon-style image for a fusion.

### Request

```
POST /sdapi/v1/txt2img
Content-Type: application/json
```

```json
{
  "prompt": "Pokemon-style creature, digital art, vibrant colors, {fusion_description}, game art, clean lines, white background",
  "negative_prompt": "realistic, photograph, human, text, watermark, blurry, low quality",
  "steps": 20,
  "width": 512,
  "height": 512,
  "cfg_scale": 7,
  "seed": -1
}
```

### Response (Success — 200)

```json
{
  "images": [
    "iVBORw0KGgoAAAANSUhEUgAA..."
  ],
  "parameters": {},
  "info": "{}"
}
```

### Response Handling

1. Extract `images[0]` (base64-encoded PNG)
2. Display as `<img src="data:image/png;base64,{images[0]}" />`
3. Do **NOT** persist to localStorage (FR-026)
4. Set `fusion.imageBase64 = null` before saving

### Availability Detection

Before attempting generation, probe the service:

```
GET /sdapi/v1/options
```

- **200**: Service available, proceed with image generation
- **Network error / timeout (2s)**: Service unavailable, use Pokemon logo placeholder (FR-012)

### Error Handling

| Scenario | App Behavior |
|----------|-------------|
| Connection refused | Show placeholder image (FR-012) |
| Timeout (>15s) | Abort, show placeholder image |
| 500 Server error | Show placeholder image |

**Image generation failure must NEVER block or interrupt fusion creation** (Constitution Principle I, FR-020).
