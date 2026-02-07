/**
 * Open Library Cover API integration.
 * Resolves book covers dynamically by searching title + author.
 * Uses the Search API to find the Open Library edition key,
 * then constructs the cover URL from the cover ID.
 *
 * Docs: https://openlibrary.org/dev/docs/api/covers
 */

const COVER_BASE = 'https://covers.openlibrary.org/b/olid'
const SEARCH_API = 'https://openlibrary.org/search.json'

// In-memory cache to avoid repeated API calls within the same session
const coverCache = new Map<string, string | null>()

/**
 * Get a cover URL for a book by title and author.
 * Returns null if no cover is found.
 */
export async function getBookCoverUrl(
  title: string,
  author: string,
  size: 'S' | 'M' | 'L' = 'M'
): Promise<string | null> {
  const cacheKey = `${title}|${author}|${size}`
  if (coverCache.has(cacheKey)) {
    return coverCache.get(cacheKey) ?? null
  }

  try {
    const query = encodeURIComponent(`${title} ${author}`)
    const response = await fetch(
      `${SEARCH_API}?q=${query}&fields=cover_edition_key,edition_key,cover_i&limit=1`,
      { signal: AbortSignal.timeout(5000) }
    )

    if (!response.ok) {
      coverCache.set(cacheKey, null)
      return null
    }

    const data = await response.json()
    const doc = data.docs?.[0]

    if (!doc) {
      coverCache.set(cacheKey, null)
      return null
    }

    // Prefer cover_i (cover ID) for direct image URL
    if (doc.cover_i) {
      const url = `https://covers.openlibrary.org/b/id/${doc.cover_i}-${size}.jpg`
      coverCache.set(cacheKey, url)
      return url
    }

    // Fallback: use edition key
    const editionKey = doc.cover_edition_key || doc.edition_key?.[0]
    if (editionKey) {
      const url = `${COVER_BASE}/${editionKey}-${size}.jpg`
      coverCache.set(cacheKey, url)
      return url
    }

    coverCache.set(cacheKey, null)
    return null
  } catch {
    coverCache.set(cacheKey, null)
    return null
  }
}
