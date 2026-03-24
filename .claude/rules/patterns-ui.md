# Pattern — UI Component (@vite-mf-monorepo/ui)

## Important
UI components live in the `vite-mf-monorepo` project under `packages/ui`.
To add or update a component:
1. Edit in `vite-mf-monorepo/packages/ui`
2. Run `pnpm build` in that package
3. Publish to npm
4. Bump `@vite-mf-monorepo/ui` version in the zone app that needs it

Do NOT create UI components directly in this project.

## Next.js variants (`@vite-mf-monorepo/ui/next`)

Components that render links have a `/next` export that uses `next/link` + `href` prop instead of `react-router-dom` + `to`:

```typescript
// In Next.js zone apps — always use /next for link components
import { MovieCard } from '@vite-mf-monorepo/ui/next'
import { Button } from '@vite-mf-monorepo/ui/next'

// Non-link components stay on the main export
import { Carousel, Typography, Tabs } from '@vite-mf-monorepo/ui'
```

Affected components: `Button` (as="link"), `MovieCard` (as="link")

---

## Existing components (reference)

### Primitives
`Avatar` `Badge` `Button` `Card` `Icon` `Image` `Modal` `Rating` `Skeleton` `Spinner` `Typography` `Talent`

### Composites
`Carousel` (+ `CarouselItem` `CarouselLoading`) `Tabs` (+ `Tabs.List` `Tabs.Trigger` `Tabs.Panel`) `HeroImage` `MovieCard` `ConditionalWrapper`

---

## Usage patterns in zone apps

### Button
```typescript jsx
// As button (main export)
import { Button } from '@vite-mf-monorepo/ui'
<Button variant="primary" onClick={handleClick}>Watch Now</Button>

// As link (next export — uses next/link)
import { Button } from '@vite-mf-monorepo/ui/next'
<Button as="link" href="/movie/123">View Details</Button>
```

### MovieCard
```typescript jsx
import { MovieCard } from '@vite-mf-monorepo/ui/next'

<MovieCard
  as="link"
  href={`/movie/${String(item.id)}`}
  id={item.id ?? 0}
  title={item.title ?? 'Unknown'}
  posterUrl={item.poster_path ?? ''}
  voteAverage={item.vote_average ?? 0}
  year={item.release_date ? new Date(item.release_date).getFullYear() : null}
/>
```

### Carousel
```typescript jsx
import { Carousel, CarouselItem, CarouselLoading } from '@vite-mf-monorepo/ui'

// Loading state
if (isLoading) return <CarouselLoading count={6} />

// Error state
if (error) return <Carousel errorMessage="Failed to load" />

// Populated
<Carousel rounded={false}>
  {items.map((item) => (
    <CarouselItem key={item.id}>
      {/* content */}
    </CarouselItem>
  ))}
</Carousel>
```

### Tabs
```typescript jsx
import { Tabs } from '@vite-mf-monorepo/ui'

<Tabs value={activeTab} onValueChange={setActiveTab} variant="pills" prefix="section-name">
  <Tabs.List>
    <Tabs.Trigger value="movie">Movies</Tabs.Trigger>
    <Tabs.Trigger value="tv">TV Shows</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="movie"><MovieCarousel /></Tabs.Panel>
  <Tabs.Panel value="tv"><TVCarousel /></Tabs.Panel>
</Tabs>
```

### Skeleton
```typescript jsx
import { Skeleton } from '@vite-mf-monorepo/ui'

// Always use Skeleton as Suspense fallback — prevents CLS
<Suspense fallback={<Skeleton variant="card" count={6} />}>
  <SomeSection />
</Suspense>
```

### Typography
```typescript jsx
import { Typography } from '@vite-mf-monorepo/ui'

<Typography variant="h2">Section Title</Typography>
<Typography variant="body">Description text</Typography>
```

---

## CSS prefix rule
All `@vite-mf-monorepo/ui` classes use the `ui:` prefix:
```html
<div className="ui:flex ui:items-center ui:gap-4">
```

Zone apps use their own prefix for layout adjustments:
```typescript jsx
<div className="hm:flex hm:flex-col">   <!-- home zone -->
  <MovieCard />
</div>
```
