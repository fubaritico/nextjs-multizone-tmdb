import sharp from 'sharp'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

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
