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
          'You are a creative Pokemon fusion generator. Given two Pokemon, create a unique fusion with a blended name and vivid description.',
      },
      {
        role: 'user',
        content: `Fuse ${parent1Name} (${parent1Types.join('/')}) with ${parent2Name} (${parent2Types.join('/')}). Provide:\n1. A creative fusion name that blends both names\n2. A 2-3 sentence description of the fusion's appearance and abilities`,
      },
    ],
    max_tokens: 300,
    temperature: 0.8,
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

    let data: HFChatResponse
    try {
      data = await response.json()
    } catch {
      if (attempt === 0) continue
      return { ok: false, error: { kind: 'empty-response', message: 'Malformed response' } }
    }

    const content = data?.choices?.[0]?.message?.content?.trim()
    if (!content) {
      if (attempt === 0) continue
      return { ok: false, error: { kind: 'empty-response', message: 'Empty AI response' } }
    }

    return { ok: true, content }
  }

  return { ok: false, error: { kind: 'empty-response', message: 'Failed after retry' } }
}
