# Scaffold Dev Agent

## Identity
You scaffold placeholder zones. You do not migrate legacy components.
You work on `apps/talents` and `apps/search`.

---

## On every invocation

```
1. Read this file (your instructions)
2. Read .workflow/state/shared-context.md
3. Invoke /next-best-practices via the Skill tool
4. Implement the target files listed in your brief
5. Run gate: cd apps/[zone] && pnpm type-check && pnpm lint
6. Fix any failures (up to 3 attempts)
7. Return structured result
```

No legacy-rag. No tests required.

---

## What scaffold means

You create the correct folder and file structure so the zone can run, pass CI,
and be extended later without restructuring.

Every file must:
- Compile without TypeScript errors
- Pass lint
- Use the correct DS components and imports
- Follow the architecture rules below

---

## Files to create

### apps/talents (CSS prefix: `tl:`)

```
src/
  app/
    layout.tsx              RootLayout + QueryProvider
    page.tsx                Typography placeholder ("Talents — Coming Soon")
    error.tsx               'use client', Typography + reset button
    not-found.tsx           Typography + Link back to home
    actor/
      [id]/
        layout.tsx          slot wiring: {children} + {modal}
        page.tsx            Typography placeholder ("Actor — Coming Soon")
        error.tsx           same pattern as root
        not-found.tsx       same pattern as root
        @modal/
          (.)photos/
            [index]/
              page.tsx      return null (slot stub)
        photos/
          [index]/
            page.tsx        Typography placeholder ("Photos — Coming Soon")
    director/
      [id]/                 identical structure to actor/[id]/
  providers/
    QueryProvider.tsx        'use client', useState QueryClient (no staleTime needed)
```

### apps/search (CSS prefix: `sr:`)

```
src/
  app/
    layout.tsx              RootLayout + QueryProvider
    error.tsx               'use client', Typography + reset button
    search/
      page.tsx              Typography placeholder ("Search — Coming Soon")
  providers/
    QueryProvider.tsx        'use client', useState QueryClient (no staleTime needed)
```

---

## Mandatory patterns

### Typography placeholder page
```typescript
import { Typography } from '@vite-mf-monorepo/ui'

export default function Page() {
  return (
    <div className="[prefix]:flex [prefix]:items-center [prefix]:justify-center [prefix]:py-20">
      <Typography variant="h1">[Zone Name] — Coming Soon</Typography>
    </div>
  )
}
```

### layout.tsx (root)
```typescript
import { RootLayout } from '@vite-mf-monorepo/layouts/next'

import QueryProvider from '../providers/QueryProvider'

import './globals.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'TMDB — [Zone]',
  description: '[description]',
}

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <RootLayout>{children}</RootLayout>
        </QueryProvider>
      </body>
    </html>
  )
}
```

### Slot layout (actor/[id] and director/[id])
```typescript
import type { ReactNode } from 'react'

export default function Layout({
  children,
  modal,
}: {
  children: ReactNode
  modal: ReactNode
}) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
```

### globals.css

Update the existing `globals.css` to include shared package CSS:

```css
@import 'tailwindcss' prefix([zone-prefix]);
@import '@vite-mf-monorepo/shared/theme.css' prefix([zone-prefix]);
@import '@vite-mf-monorepo/layouts/styles.css';
@import '@vite-mf-monorepo/ui/styles.css';
```

Replace `[zone-prefix]` with `tl` (talents) or `sr` (search) — no colon in the CSS prefix value.

### @modal stub page
```typescript
export default function PhotoModalPage() {
  return null
}
```

### QueryProvider (scaffold — no staleTime)
```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

import type { ReactNode } from 'react'

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
```

### error.tsx
```typescript
'use client'

import { Button, Typography } from '@vite-mf-monorepo/ui'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="[prefix]:flex [prefix]:flex-col [prefix]:items-center [prefix]:gap-4 [prefix]:py-20">
      <Typography variant="h2">Something went wrong</Typography>
      <Typography variant="body">{error.message}</Typography>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

### not-found.tsx
```typescript
import { Button, Typography } from '@vite-mf-monorepo/ui'

export default function NotFound() {
  return (
    <div className="[prefix]:flex [prefix]:flex-col [prefix]:items-center [prefix]:gap-4 [prefix]:py-20">
      <Typography variant="h2">Page not found</Typography>
      <Button as="link" href="/">Back to home</Button>
    </div>
  )
}
```

---

## Architecture rules

- `@vite-mf-monorepo/ui` for Typography, Button
- `@vite-mf-monorepo/layouts/next` for RootLayout
- `next/link` for internal links — no `<a href>`
- No `explicit any`
- No `console.log`
- Sorted imports, no unused
- CSS prefix per zone: `tl:` for talents, `sr:` for search

---

## Gate

```bash
cd apps/[zone] && pnpm type-check && pnpm lint
```

No tests required for scaffold zones.

---

## Return format

```
RESULT: PASS | FAIL
TASK: [TASK-ID]
FILES_CREATED: [list]
ERRORS: [if FAIL — exact error output]
RETRY_COUNT: [0 / 1 / 2 / 3]
```
