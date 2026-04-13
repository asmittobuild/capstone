/**
 * Generate both positive and negative prompts for SDXL image generation using the Hugging Face API.
 * @param apiToken Hugging Face API token
 * @param modelId Model ID to use
 * @param fusionName The AI-generated fusion name
 * @param fusionDescription The AI-generated fusion description
 * @returns { ok: true, prompts: { positive: string, negative: string } } or { ok: false, error }
 */
export async function generateImagePrompts(
  apiToken: string,
  modelId: string,
  fusionName: string,
  fusionDescription: string,
  parent1Name: string,
  parent2Name: string
): Promise<
  | { ok: true; prompts: { positive: string; negative: string } }
  | { ok: false; error: HFRateLimitError | HFError }
> {
  const body = {
    model: modelId,
    messages: [
      {
        role: 'system',
        content:
          'Given a Pokemon fusion name and description, generate two prompts:\n1. A positive prompt for official pokedex illustration style, pokemon style, clean line art, flat colors, minimal shading, cel shading, crisp outlines, simple shapes, centered composition, plain white background, high resolution, sharp lines, game asset style.\n2. A negative prompt listing undesirable traits (text, photorealistic, realistic, 3d render, hyperrealistic, detailed textures, fur texture, skin pores, cinematic lighting, dramatic shadows, depth of field, complex background, clutter, noise, grain). Respond in JSON: { "positive": "...", "negative": "..." }. Include the two parent pokemon names in the positive prompt.Important: this is for stable difussion so it must fit the 77 token limit.',
      },
      {
        role: 'user',
        content: `Fusion Name: ${fusionName}\nFusion Description: ${fusionDescription}\nParent 1: ${parent1Name}\nParent 2: ${parent2Name}`,
      },
    ],
    max_tokens: 500,
    temperature: 0.95
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    let response: Response
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
      response = await fetch(`${HF_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      clearTimeout(timer)
    } catch {
      return { ok: false, error: { kind: 'network', message: 'Network error or timeout' } }
    }

    if (response.status === 401) {
      return { ok: false, error: { kind: 'auth', message: 'Invalid or missing API token' } }
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After')
      const resetHeader = response.headers.get('X-RateLimit-Reset')
      let seconds = 60
      if (retryAfter) {
        seconds = parseInt(retryAfter, 10) || 60
      } else if (resetHeader) {
        seconds = Math.max(0, Math.ceil(parseInt(resetHeader, 10) - Date.now() / 1000))
      }
      return { ok: false, error: { kind: 'rate-limit', retryAfterSeconds: seconds } }
    }

    if (response.status >= 500) {
      return { ok: false, error: { kind: 'server', message: `Server error: ${response.status}` } }
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      if (attempt === 0) continue
      return { ok: false, error: { kind: 'empty-response', message: 'Malformed response' } }
    }

    // Handle non-OK responses that aren't 401/429/5xx (e.g. 400, 403, 404, 422)
    if (!response.ok) {
      const raw = (data as Record<string, unknown>)?.error
      let errMsg = `HTTP ${response.status}`
      if (typeof raw === 'string') {
        errMsg = raw
      } else if (raw && typeof raw === 'object' && 'message' in raw) {
        errMsg = String((raw as Record<string, unknown>).message)
      }
      return { ok: false, error: { kind: 'server', message: errMsg } }
    }

    // Try to parse the JSON from the model's response
    const typed = data as HFChatResponse
    const content = typed?.choices?.[0]?.message?.content?.trim()
    if (!content) {
      console.warn('[HF] Unexpected response shape:', JSON.stringify(data).slice(0, 500))
      if (attempt === 0) continue
      return { ok: false, error: { kind: 'empty-response', message: 'Empty AI response' } }
    }

    try {
      const parsed = JSON.parse(content)
      if (typeof parsed.positive === 'string' && typeof parsed.negative === 'string') {
        console.log('[HF PROMPTS]', { positive: parsed.positive, negative: parsed.negative })
        return { ok: true, prompts: { positive: parsed.positive, negative: parsed.negative } }
      }
    } catch (err) {
      // Not valid JSON, try again or fail
      if (attempt === 0) continue
      return { ok: false, error: { kind: 'empty-response', message: 'Malformed prompt JSON' } }
    }
  }
  return { ok: false, error: { kind: 'empty-response', message: 'Failed after retry' } }
}
const HF_BASE_URL = 'https://router.huggingface.co/v1'
const TIMEOUT_MS = 12_000

export interface HFChatResponse {
  choices: {
    message: { role: string; content: string }
    finish_reason: string
    index: number
  }[]
}

export interface HFRateLimitError {
  kind: 'rate-limit'
  retryAfterSeconds: number
}

export interface HFError {
  kind: 'auth' | 'server' | 'network' | 'empty-response'
  message: string
}

export type HFResult =
  | { ok: true; content: string }
  | { ok: false; error: HFRateLimitError | HFError }

export async function generateFusionText(
  apiToken: string,
  modelId: string,
  parent1Name: string,
  parent1Types: string[],
  parent2Name: string,
  parent2Types: string[],
): Promise<HFResult> {
  const body = {
    model: modelId,
    messages: [
      {
        role: 'system',
        content:
          'You are a creative Pokemon fusion generator. Given two Pokemon, create a unique fusion with a blended name and vivid short description.',
      },
      {
        role: 'user',
        content: `Fuse ${parent1Name} (${parent1Types.join('/')}) with ${parent2Name} (${parent2Types.join('/')}). Provide:\n1. A creative fusion name that blends both names\n2. A 2-3 sentence description of the fusion's appearance and abilities`,
      },
    ],
    max_tokens: 300,
    temperature: 0.9,
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    let response: Response
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
      response = await fetch(`${HF_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      clearTimeout(timer)
    } catch {
      return { ok: false, error: { kind: 'network', message: 'Network error or timeout' } }
    }

    if (response.status === 401) {
      return { ok: false, error: { kind: 'auth', message: 'Invalid or missing API token' } }
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After')
      const resetHeader = response.headers.get('X-RateLimit-Reset')
      let seconds = 60
      if (retryAfter) {
        seconds = parseInt(retryAfter, 10) || 60
      } else if (resetHeader) {
        seconds = Math.max(0, Math.ceil(parseInt(resetHeader, 10) - Date.now() / 1000))
      }
      return { ok: false, error: { kind: 'rate-limit', retryAfterSeconds: seconds } }
    }

    if (response.status >= 500) {
      return { ok: false, error: { kind: 'server', message: `Server error: ${response.status}` } }
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      if (attempt === 0) continue
      return { ok: false, error: { kind: 'empty-response', message: 'Malformed response' } }
    }

    // Handle non-OK responses that aren't 401/429/5xx (e.g. 400, 403, 404, 422)
    if (!response.ok) {
      const raw = (data as Record<string, unknown>)?.error
      let errMsg = `HTTP ${response.status}`
      if (typeof raw === 'string') {
        errMsg = raw
      } else if (raw && typeof raw === 'object' && 'message' in raw) {
        errMsg = String((raw as Record<string, unknown>).message)
      }
      return { ok: false, error: { kind: 'server', message: errMsg } }
    }

    const typed = data as HFChatResponse
    const content = typed?.choices?.[0]?.message?.content?.trim()
    if (!content) {
      console.warn('[HF] Unexpected response shape:', JSON.stringify(data).slice(0, 500))
      if (attempt === 0) continue
      return { ok: false, error: { kind: 'empty-response', message: 'Empty AI response' } }
    }

    return { ok: true, content }
  }

  return { ok: false, error: { kind: 'empty-response', message: 'Failed after retry' } }
}
