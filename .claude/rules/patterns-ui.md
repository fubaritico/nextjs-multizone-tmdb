# Pattern — UI Component (@fubar-it-co/ui)

## Important
UI components live in the `vite-mf-monorepo` project under `packages/ui`.
To add or update a component:
1. Edit in `vite-mf-monorepo/packages/ui`
2. Run `pnpm build` in that package
3. Publish to npm
4. Bump `@fubar-it-co/ui` version in the zone app that needs it

Do NOT create UI components directly in this project.

## ⚠️ Pending: React Router → Next.js link migration
Some components in `@fubar-it-co/ui` still use `to` prop (React Router) instead of `href` (next/link).
This migration is in progress in `vite-mf-monorepo`.

**Before using any component with a link prop:**
1. Check whether it has been republished with `href` support
2. If not — use `/explore-legacy` to see the current prop shape, then open the component in `vite-mf-monorepo` and migrate it first

Affected components (known): `Button` (as="link"), `MovieCard` (as="link")

---

## Existing components (reference)

### Primitives
`Avatar` `Badge` `Button` `Card` `Icon` `Image` `Modal` `Rating` `Skeleton` `Spinner` `Typography` `Talent`

### Composites
`Carousel` (+ `CarouselItem` `CarouselLoading`) `Tabs` (+ `Tabs.List` `Tabs.Trigger` `Tabs.Panel`) `HeroImage` `MovieCard` `ConditionalWrapper`

---

## Usage patterns in zone apps

### Button
```typescript
import { Button } from '@fubar-it-co/ui'

// As button
<Button variant="primary" onClick={handleClick}>Watch Now</Button>

// As link (next/link internally)
<Button as="link" to="/movie/123">View Details</Button>
```

### MovieCard
```typescript
import { MovieCard } from '@fubar-it-co/ui'

<MovieCard
  as="link"
  to={`/movie/${String(item.id)}`}
  id={item.id ?? 0}
  title={item.title ?? 'Unknown'}
  posterUrl={item.poster_path ?? ''}
  voteAverage={item.vote_average ?? 0}
  year={item.release_date ? new Date(item.release_date).getFullYear() : null}
/>
```

### Carousel
```typescript
import { Carousel, CarouselItem, CarouselLoading } from '@fubar-it-co/ui'

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
```typescript
import { Tabs } from '@fubar-it-co/ui'

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
```typescript
import { Skeleton } from '@fubar-it-co/ui'

// Always use Skeleton as Suspense fallback — prevents CLS
<Suspense fallback={<Skeleton variant="card" count={6} />}>
  <SomeSection />
</Suspense>
```

### Typography
```typescript
import { Typography } from '@fubar-it-co/ui'

<Typography variant="h2">Section Title</Typography>
<Typography variant="body">Description text</Typography>
```

---

## CSS prefix rule
All `@fubar-it-co/ui` classes use the `ui:` prefix:
```html
<div className="ui:flex ui:items-center ui:gap-4">
```

Zone apps use their own prefix for layout adjustments:
```html
<div className="hm:flex hm:flex-col">   <!-- home zone -->
  <MovieCard ... />
</div>
```
