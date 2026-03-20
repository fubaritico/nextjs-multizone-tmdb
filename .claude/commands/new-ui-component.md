Create a new UI component in the `@vite-mf-monorepo/ui` package.

Reference: `rules/patterns-ui.md`

## Important
UI components live in `vite-mf-monorepo/packages/ui` — NOT in this project.
This command guides you through creating the component there, then consuming it here.

## Arguments
`$ARGUMENTS` = component name (e.g. `TagList`, `ProgressBar`)

## Steps

### In vite-mf-monorepo (packages/ui)

1. Open `vite-mf-monorepo/packages/ui/src/` and read an existing similar component as reference
2. Create `packages/ui/src/$ARGUMENTS/$ARGUMENTS.tsx` using `const Name: FC<NameProps>` pattern
3. If props require a discriminated union, create `packages/ui/src/$ARGUMENTS/$ARGUMENTS.types.ts`
4. Create `packages/ui/src/$ARGUMENTS/$ARGUMENTS.test.tsx` with loading/error/interaction tests
5. Create `packages/ui/src/$ARGUMENTS/index.ts` re-exporting the component
6. Add export to `packages/ui/src/index.ts`
7. Run `/story $ARGUMENTS` in vite-mf-monorepo to create the Storybook story
8. Build and publish the package:
   ```bash
   cd packages/ui && pnpm build
   # bump version in package.json
   npm publish
   ```

### In nextjs-multizone-tmdb

9. Bump `@vite-mf-monorepo/ui` version in the zone app's `package.json`
10. Run `pnpm install`
11. Import and use the new component

## Rules
- `ui:` prefix on ALL Tailwind classes
- No domain logic (no TMDB/movie concepts in the component itself)
- Extend appropriate HTML attributes
- Export interface as named export, component as default
- Use `clsx` for conditional classes
- Story is mandatory — always run `/story` after creating the component
