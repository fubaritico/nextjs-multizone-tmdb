/**
 * TODO: MSW tests for TVTrailersSection are skipped because `tvSeriesVideosHandlers`
 * and the corresponding mock data are not yet available in `@vite-mf-monorepo/shared/mocks`.
 * Once the upstream package publishes TV video handlers, implement tests following
 * the same pattern as `MovieTrailersSection.test.tsx`:
 *   - renders the trailers section heading
 *   - renders iframe with correct YouTube embed URL
 *   - renders the trailers section with correct data-testid
 *   - renders loading state while fetching
 *   - renders nothing on error
 */

import { describe, it } from 'vitest'

describe('TVTrailersSection', () => {
  it.todo(
    'renders iframe embeds with correct YouTube URLs — pending tvSeriesVideosHandlers in shared/mocks'
  )
  it.todo(
    'renders nothing when no trailers match the filter — pending tvSeriesVideosHandlers in shared/mocks'
  )
  it.todo(
    'renders nothing on error — pending tvSeriesVideosHandlers in shared/mocks'
  )
})
