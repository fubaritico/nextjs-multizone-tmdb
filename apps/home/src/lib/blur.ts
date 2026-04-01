import sharp from 'sharp'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

/** Plain object mapping TMDB path → base64 blur data URL (JSON-serializable) */
export type BlurDataMap = Record<string, string>

/**
 * Fetches a TMDB image at the smallest available size and returns a tiny
 * base64-encoded data URL suitable for `next/image` `blurDataURL`.
 *
 * Uses `w300` (smallest backdrop size) as source, then sharp resizes to
 * ~10px width for a ~200-byte inline placeholder.
 *
 * Returns `undefined` on failure (network error, invalid image) so callers
 * can safely fall back to no blur placeholder.
 */
export async function getBlurDataURL(
  tmdbPath: string,
  size = 'w300'
): Promise<string | undefined> {
  try {
    const response = await fetch(`${TMDB_IMAGE_BASE}/${size}${tmdbPath}`)

    if (!response.ok) return undefined

    const buffer = Buffer.from(await response.arrayBuffer())
    const resized = await sharp(buffer)
      .resize(10)
      .webp({ quality: 20 })
      .toBuffer()

    return `data:image/webp;base64,${resized.toString('base64')}`
  } catch {
    return undefined
  }
}

/**
 * Generates blur data URLs for multiple TMDB paths in parallel.
 * Returns a plain object (JSON-serializable for server→client boundary).
 */
export async function getBlurDataMap(
  paths: (string | null | undefined)[]
): Promise<BlurDataMap> {
  const validPaths = paths.filter((p): p is string => Boolean(p))
  const results = await Promise.allSettled(
    validPaths.map(async (path) => ({
      path,
      blur: await getBlurDataURL(path),
    }))
  )

  const map: BlurDataMap = {}

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.blur) {
      map[result.value.path] = result.value.blur
    }
  }

  return map
}
