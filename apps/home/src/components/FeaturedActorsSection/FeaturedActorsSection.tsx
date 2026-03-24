import { Section } from '@vite-mf-monorepo/layouts'
import { Typography } from '@vite-mf-monorepo/ui'

import FeaturedActorsCarousel from './FeaturedActorsCarousel'

/**
 * Featured actors section for the home zone.
 *
 * Renders a section title and delegates actor display to
 * {@link FeaturedActorsCarousel}. This is a Server Component because it owns
 * no state and performs no data fetching — it is a pure layout shell.
 *
 * Data is prefetched server-side in `page.tsx` via `personPopularListOptions`
 * and hydrated into the TanStack Query cache before this renders.
 */
export default function FeaturedActorsSection() {
  return (
    <Section>
      <div className="hm:flex hm:flex-col hm:gap-4">
        <Typography variant="h2">Featured Actors</Typography>
        <FeaturedActorsCarousel />
      </div>
    </Section>
  )
}
