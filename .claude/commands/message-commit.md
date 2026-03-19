Prepare and propose a conventional commit message only for the current changes.

## Steps

1. Run `git status` to see changed files
2. Run `git diff --staged` and `git diff` to analyze all changes
3. Identify the scope based on changed files:
   - `apps/web` → scope `web`
   - `apps/home` → scope `home`
   - `apps/media` → scope `media`
   - `apps/talents` → scope `talents`
   - `apps/search` → scope `search`
   - `turbo.json` or root config → scope `build`
   - Multiple zones → use the most impacted scope
4. Generate a conventional commit message only — do not stage or commit

## Commit format
```
type(scope): subject

- bullet point detail if needed
```

## Allowed types
`feat` `fix` `refactor` `style` `test` `docs` `chore` `build` `ci` `perf` `revert`

## Rules
- Subject: lowercase, no trailing period, max 100 chars total
- Body: bullet points for non-obvious changes
- One feature per commit — do not accumulate unrelated changes
