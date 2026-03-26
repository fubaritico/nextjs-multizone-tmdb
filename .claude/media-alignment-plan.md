# Media Page — Legacy vs Next Alignment Plan

Comparison: Legacy (Greenland 2) vs Next (Peaky Blinders) on movie detail page.

## Differences

| # | Section | Legacy | Next | Fix needed |
|---|---------|--------|------|------------|
| 1 | **Section order** | Hero → Synopsis → Crew → Cast → Trailers → Similar → Recommended | Hero → Synopsis → Crew → Photos → Cast → ??? → You may also like → Recommended for you | Reorder to match legacy |
| 2 | **Crew** | Text-only: bold name + role below, no avatars | Circular profile photos + name + role | Remove avatars, make text-only |
| 3 | **Cast** | Horizontal carousel (profile photos, name, character) | 2-column vertical list + "Whole cast" button | Change to carousel (already noted as post-migration fix) |
| 4 | **Photos/Backdrops** | Not a section on the detail page (was a separate app) | Grid of backdrops inline on detail page | Check legacy — was backdrop grid on detail page or only via route? |
| 5 | **Trailers heading** | "Trailers" | Not clearly visible / possibly misplaced | Verify section exists and is in correct position |
| 6 | **Similar heading** | "Similar" | "You may also like" | Change to "Similar" |
| 7 | **Recommended heading** | "Recommended" | "Recommended for you" | Change to "Recommended" |
| 8 | **Trailers position** | After Cast, before Similar | Unclear — may be mixed with Photos | Move after Cast, before Similar |

## Steps

### Step 1 — Fix section order in page.tsx
Reorder sections to: Hero → Synopsis → Crew → Cast → Trailers → Backdrops → Similar → Recommended
(Compare legacy page component vs next page.tsx)

### Step 2 — Fix Crew section (remove avatars)
Make Crew text-only: bold name + job title, no profile images.
(Compare legacy Crew component vs next MovieCrew/TVCrew)

### Step 3 — Fix Cast section (carousel, not list)
Already noted: CastSection should be a carousel, not a list.
(Compare legacy Cast component vs next MovieCastCarousel/TVCastCarousel)

### Step 4 — Fix section headings
- "You may also like" → "Similar"
- "Recommended for you" → "Recommended"
(Compare legacy section components)

### Step 5 — Verify Trailers section
Ensure Trailers section renders correctly and is positioned after Cast.
(Compare legacy Trailers component)

### Step 6 — Verify Photos/Backdrops placement
Check if legacy had a backdrop grid on the detail page or only as a separate route.
Adjust placement accordingly.

## Status
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3
- [ ] Step 4
- [ ] Step 5
- [ ] Step 6
