# Fix: MovieCard `as="link"` uses React Router instead of Next.js Link

## Problem

`MovieCard` in `@vite-mf-monorepo/ui` uses `react-router-dom`'s `<Link>` when rendered with `as="link"`. This crashes in Next.js apps because there is no React Router context.

### Current (broken for Next.js)

```tsx
// packages/ui/src/MovieCard/MovieCard.tsx
import { Link } from 'react-router-dom'

if (as === 'link' && to) {
  return <Link to={to} className="ui:block ui:no-underline ui:text-inherit">{cardContent}</Link>
}
```

### Consequence

In the Next.js multi-zone project, `MovieCard as="link" to="/movie/123"` renders a React Router `<Link>` which:
1. Crashes without Router context: `TypeError: Cannot destructure property 'basename' of 'React10.useContext(...)' as it is null`
2. Doesn't integrate with Next.js routing (no prefetching, no client-side navigation)
3. Forces consumers to mock `react-router-dom` in tests

### Consumer workaround (current)

In `nextjs-multizone-tmdb`, we globally mock `react-router-dom` in `vitest.setup.ts`:
```typescript
vi.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }) => createElement('a', { href: to, ...props }, children),
}))
```

At runtime, Next.js bundler tree-shakes react-router-dom and the `<Link>` falls back to a plain `<a>` — but this means no client-side navigation.

## Fix needed in vite-mf-monorepo

### Option A: Polymorphic link component (recommended)

Accept a `linkComponent` prop or use a context-based link provider so consumers can inject their own link component:

```tsx
// packages/ui/src/providers/LinkProvider.tsx
import { createContext, useContext } from 'react'

type LinkComponent = React.ComponentType<{ to: string; className?: string; children: React.ReactNode }>

const LinkContext = createContext<LinkComponent | null>(null)

export const LinkProvider = LinkContext.Provider
export const useLink = () => useContext(LinkContext)
```

```tsx
// packages/ui/src/MovieCard/MovieCard.tsx
import { useLink } from '../providers/LinkProvider'

// Inside MovieCard:
const LinkComp = useLink()

if (as === 'link' && to) {
  if (LinkComp) {
    return <LinkComp to={to} className="ui:block ui:no-underline ui:text-inherit">{cardContent}</LinkComp>
  }
  // Fallback: plain <a> tag
  return <a href={to} className="ui:block ui:no-underline ui:text-inherit">{cardContent}</a>
}
```

Next.js consumer wraps with:
```tsx
import Link from 'next/link'
import { LinkProvider } from '@vite-mf-monorepo/ui'

const NextLink = ({ to, children, ...props }) => <Link href={to} {...props}>{children}</Link>

<LinkProvider value={NextLink}>
  <MovieCard as="link" to="/movie/123" ... />
</LinkProvider>
```

### Option B: Accept `href` prop and render `<a>` (simpler)

Change `MovieCard` to accept `href` instead of `to`, render a plain `<a>` tag, and let the consumer wrap with their framework's link component:

```tsx
if (as === 'link' && href) {
  return <a href={href} className="ui:block ui:no-underline ui:text-inherit">{cardContent}</a>
}
```

### Option C: Keep `to` but use `<a>` with optional wrapper

Remove `react-router-dom` dependency entirely. Render `<a href={to}>` and let consumers wrap with `next/link` or React Router's `<Link>` as needed.

## After fix

1. Remove `react-router-dom` from `@vite-mf-monorepo/ui` dependencies
2. Bump version and republish
3. In `nextjs-multizone-tmdb`: update `MovieCard` usage if API changed
4. Remove `react-router-dom` mock from `vitest.setup.ts`

## Affected components

- `MovieCard` — `as="link"` renders `<Link to={to}>` from react-router-dom
- `Button` — `as="link"` also renders `<Link>` from react-router-dom (see separate fix file)