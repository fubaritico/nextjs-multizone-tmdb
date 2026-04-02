import { afterEach, describe, expect, it, vi } from 'vitest'

import { getBlurDataMap, getBlurDataURL } from './blur'

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

describe('getBlurDataMap', () => {
  it('returns a map of path to blur data URL', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(FAKE_BUFFER.buffer),
    } as Response)

    const map = await getBlurDataMap(['/a.jpg', '/b.jpg'])

    expect(Object.keys(map)).toHaveLength(2)
    expect(map['/a.jpg']).toMatch(/^data:image\/webp;base64,/)
    expect(map['/b.jpg']).toMatch(/^data:image\/webp;base64,/)
  })

  it('filters out null and undefined paths', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(FAKE_BUFFER.buffer),
    } as Response)

    const map = await getBlurDataMap(['/a.jpg', null, undefined, '/b.jpg'])

    expect(Object.keys(map)).toHaveLength(2)
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('omits entries where blur generation fails', async () => {
    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(FAKE_BUFFER.buffer),
      } as Response)
      .mockResolvedValueOnce({ ok: false } as Response)

    const map = await getBlurDataMap(['/good.jpg', '/bad.jpg'])

    expect(Object.keys(map)).toHaveLength(1)
    expect(map['/good.jpg']).toBeDefined()
    expect(map['/bad.jpg']).toBeUndefined()
  })

  it('returns empty map for empty input', async () => {
    const map = await getBlurDataMap([])

    expect(map).toEqual({})
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
