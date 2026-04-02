import { afterEach, describe, expect, it, vi } from 'vitest'

import { getBlurDataURL } from './blur'

const FAKE_WEBP_BASE64 = 'UklGRh4AAABXRUJQVlA4IBIAAAAwAQCdASoCAAEAAQ'
const FAKE_BUFFER = Buffer.from('fake-image')

vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    toBuffer: vi
      .fn()
      .mockResolvedValue(Buffer.from(FAKE_WEBP_BASE64, 'base64')),
  })),
}))

const fetchSpy = vi.spyOn(globalThis, 'fetch')

afterEach(() => {
  vi.clearAllMocks()
})

describe('getBlurDataURL', () => {
  it('returns a base64 data URL on success', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(FAKE_BUFFER.buffer),
    } as Response)

    const result = await getBlurDataURL('/photo.jpg')

    expect(result).toMatch(/^data:image\/webp;base64,/)
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://image.tmdb.org/t/p/w300/photo.jpg'
    )
  })

  it('uses custom size parameter', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(FAKE_BUFFER.buffer),
    } as Response)

    await getBlurDataURL('/photo.jpg', 'w780')

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://image.tmdb.org/t/p/w780/photo.jpg'
    )
  })

  it('returns undefined when fetch responds with non-ok status', async () => {
    fetchSpy.mockResolvedValue({ ok: false } as Response)

    const result = await getBlurDataURL('/bad.jpg')

    expect(result).toBeUndefined()
  })

  it('returns undefined when fetch throws', async () => {
    fetchSpy.mockRejectedValue(new Error('Network error'))

    const result = await getBlurDataURL('/fail.jpg')

    expect(result).toBeUndefined()
  })
})
