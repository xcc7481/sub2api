export interface KeyCatalogModel {
  id: string
  name: string
}

export function isConcreteModelID(id: string): boolean {
  return Boolean(id) && !/[\s*\p{Cc}]/u.test(id)
}

export async function fetchKeyModelCatalog(
  baseUrl: string,
  kind: 'gemini' | 'openai',
  apiKey: string,
  signal: AbortSignal
): Promise<KeyCatalogModel[]> {
  const response = await fetch(`${baseUrl}/models`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
    signal
  })
  if (!response.ok) throw new Error(`Model catalog request failed with status ${response.status}`)

  const payload = await response.json()
  const entries = kind === 'gemini' ? payload?.models : payload?.data
  if (!Array.isArray(entries)) throw new Error('Invalid model catalog response')

  const models = new Map<string, KeyCatalogModel>()
  for (const entry of entries) {
    const rawID = kind === 'gemini' ? entry?.name : entry?.id
    if (typeof rawID !== 'string') continue
    const id = kind === 'gemini' ? rawID.trim().replace(/^models\//, '') : rawID.trim()
    if (!isConcreteModelID(id) || models.has(id)) continue
    if (kind === 'gemini' && (
      !/^[a-z0-9][a-z0-9_.-]*$/i.test(id) ||
      !Array.isArray(entry.supportedGenerationMethods) ||
      !entry.supportedGenerationMethods.includes('generateContent')
    )) continue
    // Native text clients also receive some models dedicated to image or video generation.
    const modelName = id.slice(id.lastIndexOf('/') + 1)
    if (/^(?:gemini-.*(?:-image(?:-|$)|-tts(?:-|$))|imagen-|veo-|gpt-image-|grok-imagine(?:-|$)|dall-e-)/i.test(modelName)) continue

    const name = kind === 'gemini' ? entry.displayName : entry.display_name
    models.set(id, { id, name: typeof name === 'string' && name.trim() ? name.trim() : id })
  }
  return [...models.values()]
}
