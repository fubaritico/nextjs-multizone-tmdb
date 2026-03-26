Gather all necessary written context from the previous session.

## Steps

1. Read `CLAUDE.md` (project root) to load current Session State and reference file list
2. Based on `### Next`, autonomously infer which rule files are relevant and load them:
   - Setting up zones / Turborepo → `rules/architecture.md`
   - Building a page or layout → `rules/patterns-server-component.md`
   - Building a section with tabs or state → `rules/patterns-client-component.md` + `rules/patterns-hydration.md`
   - Building a mutation / Server Action → `rules/patterns-server-action.md`
   - Working with UI components → `rules/patterns-ui.md`
   - When in doubt → load `rules/architecture.md` as baseline
3. Confirm to the user which files were loaded and why
4. Remind the user of the next step from `### Next` in CLAUDE.md
