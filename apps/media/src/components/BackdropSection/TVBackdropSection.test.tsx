/**
 * @todo TVBackdropSection tests are intentionally skipped.
 *
 * The `tvSeriesImagesHandlers` MSW handler is not yet available in
 * `@vite-mf-monorepo/shared/mocks` (TV images endpoint not yet mocked).
 * Once the upstream package exposes `tvSeriesImagesHandlers` and
 * `mockTVSeriesImages`, add full test coverage matching the
 * MovieBackdropSection test pattern.
 *
 * Required upstream additions:
 *   - `mockTVSeriesImages` data fixture
 *   - `tvSeriesImagesHandlers.tvSeriesImages` (success)
 *   - `tvSeriesImagesHandlers.tvSeriesImagesLoading` (infinite delay)
 *   - `tvSeriesImagesHandlers.tvSeriesImagesError` (500)
 */

import { describe, it } from 'vitest'

describe('TVBackdropSection', () => {
  it.todo(
    'renders the Photos heading once tvSeriesImagesHandlers is available in shared/mocks'
  )
  it.todo(
    'renders up to 4 backdrop images once tvSeriesImagesHandlers is available in shared/mocks'
  )
  it.todo(
    'renders links with correct /tv/{id}/photos/{index} href once tvSeriesImagesHandlers is available'
  )
  it.todo(
    'renders nothing on error once tvSeriesImagesHandlers is available in shared/mocks'
  )
})
