'use client'

import { Section } from '@vite-mf-monorepo/layouts'
import { Tabs, Typography } from '@vite-mf-monorepo/ui'
import { useState } from 'react'

import { DEFAULT_TRENDING_TIME_WINDOW } from '../../types/home'

import TrendingCarousel from './TrendingCarousel'

import type { TimeWindow } from '../../types/home'
import type { FC } from 'react'

/** Props for {@link TrendingSection}. */
interface TrendingSectionProps {
  /** Initial time window to display. Defaults to {@link DEFAULT_TRENDING_TIME_WINDOW}. */
  initialTimeWindow?: TimeWindow
}

/**
 * Trending section for the home zone.
 *
 * Renders a tabbed section that lets users switch between "Today" and
 * "This Week" trending content. Tab state is owned here; data fetching
 * is delegated to {@link TrendingCarousel}.
 *
 * This is a Client Component because it manages tab state with `useState`.
 *
 * @param initialTimeWindow - The time window pre-selected on first render
 *   (passed from the Server Component so it matches the prefetched query).
 */
const TrendingSection: FC<TrendingSectionProps> = ({
  initialTimeWindow = DEFAULT_TRENDING_TIME_WINDOW,
}) => {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(initialTimeWindow)

  return (
    <Section spacing="lg" maxWidth="xl">
      <Typography variant="h2">Trending</Typography>
      <Tabs
        value={timeWindow}
        onValueChange={(v) => {
          setTimeWindow(v as TimeWindow)
        }}
        variant="pills"
        prefix="trending"
      >
        <Tabs.List>
          <Tabs.Trigger value="day">Today</Tabs.Trigger>
          <Tabs.Trigger value="week">This Week</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="day">
          <TrendingCarousel timeWindow="day" />
        </Tabs.Panel>
        <Tabs.Panel value="week">
          <TrendingCarousel timeWindow="week" />
        </Tabs.Panel>
      </Tabs>
    </Section>
  )
}

export default TrendingSection
