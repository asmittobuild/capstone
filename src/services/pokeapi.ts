const CACHE = new Map<number, string>()
const TIMEOUT_MS = 3_000

export async function getFlavorText(pokemonId: number): Promise<string | null> {
  const cached = CACHE.get(pokemonId)
  if (cached !== undefined) return cached

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`,
      { signal: controller.signal },
    )
    clearTimeout(timer)

    if (!response.ok) return null

    const data = await response.json()
    const entries = data.flavor_text_entries?.filter(
      (e: { language: { name: string } }) => e.language.name === 'en',
    ) ?? []

    // Prefer recent game versions
    const text = entries.length > 0
      ? entries[entries.length - 1].flavor_text.replace(/\f|\n/g, ' ')
      : null

    if (text) CACHE.set(pokemonId, text)
    return text
  } catch {
    return null
  }
}
