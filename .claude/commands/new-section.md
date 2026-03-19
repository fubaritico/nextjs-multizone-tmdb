Create a new section component in a zone app following the Next.js 15 SSR patterns.

Reference files:
- `rules/patterns-server-component.md`
- `rules/patterns-client-component.md`
- `rules/patterns-hydration.md`

## Arguments
`$ARGUMENTS` = `[ZoneName] [SectionName]`
Example: `/new-section home TrendingSection` or `/new-section media CastSection`

## CSS prefix per zone
- `apps/home` → `hm:`
- `apps/media` → `mda:`
- `apps/talents` → `tl:`
- `apps/search` → `sr:`

## Steps

1. Read an existing section in the target zone as reference.
   If the zone has no sections yet, run `/explore-legacy` to find the equivalent in vite-mf-monorepo.

2. Read `rules/patterns-hydration.md` — critical for queryKey consistency before writing any data fetching code.

3. Determine if the section needs client interactivity (tabs, state) or is purely presentational:
   - **Purely presentational** → Server Component (no `'use client'`)
   - **Has tabs / state** → Client Component (`'use client'`) receiving `initial*` props

4. Create `apps/[zone]/src/components/[Name]/[Name].tsx`:

   **If Client Component**:
   - `'use client'` at top
   - Receives `initial*` props (e.g. `initialMediaType`, `initialTimeWindow`)
   - `useState(initialProp)` — never hardcode default state
   - `useQuery` with the same options factory used in `prefetchQuery` on the page
   - Handle loading (`Skeleton`), error (`Typography` message), empty (`return null`), success states
   - Use `Section` from `@fubar-it-co/layouts`
   - Use correct CSS prefix for the zone

   **If Server Component**:
   - `async function` — no hooks
   - Wrap in `<Suspense fallback={<Skeleton />}>` at call site in page.tsx

5. Add `prefetchQuery` for this section's data in the zone's `app/page.tsx`:
   - Add to the `Promise.all([...])` block
   - Pass `initial*` props down to the section

6. Create `apps/[zone]/src/components/[Name]/[Name].test.tsx`

7. Create `apps/[zone]/src/components/[Name]/index.ts`

8. Import and add the section to the relevant `app/page.tsx`

## Rules
- Never pass fetched data as props from page to section — use prefetch + useQuery
- `prefetchQuery` and `useQuery` MUST use the same options factory → guaranteed cache HIT
- Section title always visible (not conditional on data)
- Return null for empty state (hide section entirely)
