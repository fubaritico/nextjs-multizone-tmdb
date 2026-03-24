# Fix: Button `as="link"` uses React Router instead of Next.js Link

## Problem

`Button` in `@vite-mf-monorepo/ui` uses `react-router-dom`'s `<Link>` when rendered with `as="link"`. This crashes in Next.js apps because there is no React Router context.

### Current (broken for Next.js)

```tsx
// packages/ui/src/Button/Button.tsx
import { Link } from 'react-router-dom'

if (props.as === 'link') {
  const { as, variant, size, icon, iconPosition, className, children, ...linkProps } = props
  return <Link className={classes} {...linkProps}>{content}</Link>
}
```

The `Button` with `as="link"` spreads `linkProps` (which includes `to`) onto React Router's `<Link>`.

### Consequence

Same as MovieCard — crashes without React Router context, no Next.js routing integration.

### Props shape (current)

When `as="link"`, the Button accepts:
- `to: string` — destination path (React Router prop)
- All standard Button props (variant, size, icon, etc.)

## Fix needed in vite-mf-monorepo

### Option A: LinkProvider context (recommended — same as MovieCard)

Use the shared `LinkProvider` context from the MovieCard fix:

```tsx
// packages/ui/src/Button/Button.tsx
import { useLink } from '../providers/LinkProvider'

const LinkComp = useLink()

if (props.as === 'link') {
  const { as, variant, size, icon, iconPosition, className, children, ...rest } = props
  if (LinkComp) {
    return <LinkComp to={rest.to} className={classes}>{content}</LinkComp>
  }
  return <a href={rest.to} className={classes}>{content}</a>
}
```

### Option B: Render `<a>` directly

```tsx
if (props.as === 'link') {
  const { as, variant, size, icon, iconPosition, className, children, to, ...rest } = props
  return <a href={to} className={classes} {...rest}>{content}</a>
}
```

## After fix

Same as MovieCard:
1. Remove `react-router-dom` from `@vite-mf-monorepo/ui` dependencies
2. Bump version and republish
3. Update usage in `nextjs-multizone-tmdb` if API changed
4. Remove `react-router-dom` mock from `vitest.setup.ts`