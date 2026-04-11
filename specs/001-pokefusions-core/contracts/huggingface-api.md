# API Contracts: Hugging Face Chat Completions

**Service**: Hugging Face Inference API (Required)
**Base URL**: `https://router.huggingface.co/v1`

## Generate Fusion Text

Generates an AI-blended name and description for a Pokemon fusion.

### Request

```
POST /chat/completions
Authorization: Bearer {apiToken}
Content-Type: application/json
```

```json
{
  "model": "{modelId}",
  "messages": [
    {
      "role": "system",
      "content": "You are a creative Pokemon fusion generator. Given two Pokemon, create a unique fusion with a blended name and vivid description."
    },
    {
      "role": "user",
      "content": "Fuse {parent1.name} ({parent1.types}) with {parent2.name} ({parent2.types}). Provide:\n1. A creative fusion name that blends both names\n2. A 2-3 sentence description of the fusion's appearance and abilities"
    }
  ],
  "max_tokens": 300,
  "temperature": 0.8
}
```

### Response (Success — 200)

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "**Name**: Charbasaur\n\n**Description**: A sturdy reptilian creature with a flame-tipped bulb on its back..."
      },
      "finish_reason": "stop",
      "index": 0
    }
  ],
  "usage": {
    "prompt_tokens": 85,
    "completion_tokens": 120,
    "total_tokens": 205
  }
}
```

### Response Parsing

The app must parse `choices[0].message.content` to extract:
1. **Fusion name**: First line or text after "Name:" marker
2. **Description**: Remaining text after "Description:" marker

Parsing should be resilient to formatting variations. If parsing fails, use the full content as the description and generate a fallback name from parent names (e.g., "Char" + "saur" = "Charsaur").

### Error Responses

| Status | Meaning | App Behavior |
|--------|---------|-------------|
| 401 | Invalid/missing API token | Show settings prompt (FR-023) |
| 429 | Rate limited | Show cooldown message, disable Generate button (FR-024) |
| 500+ | Server error | Show error with retry button (FR-016) |
| Network error | Service unreachable | Show error with retry button (FR-016) |

### Rate Limit Headers

```
X-RateLimit-Limit: {max_requests}
X-RateLimit-Remaining: {remaining}
X-RateLimit-Reset: {unix_timestamp}
Retry-After: {seconds}
```

Use `Retry-After` or `X-RateLimit-Reset` to calculate cooldown duration for the UI timer.
