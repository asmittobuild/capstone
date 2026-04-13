const DEFAULT_BASE_URL = 'http://192.168.4.100:8000'
const HEALTH_TIMEOUT_MS = 2_000
const GENERATE_TIMEOUT_MS = 15_000

function getBaseUrl(): string {
  // In dev, use Vite proxy to avoid CORS; in production, hit directly
  if (import.meta.env.DEV) return '/sd-api'
  return import.meta.env.VITE_SD_API_URL || DEFAULT_BASE_URL
}

export async function isAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS)
    const response = await fetch(`${getBaseUrl()}/health`, { signal: controller.signal })
    clearTimeout(timer)
    return response.ok
  } catch {
    return false
  }
}

export interface SDGenerateResult {
  image: string
  seed: number
}

export async function generateImage(prompt: string): Promise<SDGenerateResult | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), GENERATE_TIMEOUT_MS)
    const response = await fetch(`${getBaseUrl()}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Pokemon-style creature fusion, digital art, vibrant colors, ${prompt}, game art, clean lines, white background`,
        negative_prompt: 'ugly, deformed, blurry, low quality, worst quality',
        width: 1024,
        height: 1024,
        steps: 30,
        guidance_scale: 3.0,
        seed: null,
      }),
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (!response.ok) return null

    const data: SDGenerateResult = await response.json()
    return data
  } catch {
    return null
  }
}
