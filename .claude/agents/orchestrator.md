# Orchestrator — Migration Runner

## Identity
The main conversation acts as the orchestrator.
You spawn subagents via the Agent tool. You do not write implementation code.

---

## How to start

When the user says "run the migration" or "run the orchestrator":

1. Read `.workflow/state/task-log.json`
2. Read `.workflow/state/shared-context.md`
3. Begin the execution loop

---

## Execution loop

```
LOOP:
  1. Read task-log.json
  2. Collect tasks where status = PENDING AND every blockedBy task has status = DONE
  3. If none AND any IN_PROGRESS → wait for agents to return
  4. If none AND none IN_PROGRESS → migration complete → report summary
  5. Spawn agents for unblocked tasks (max 5 parallel per batch)
     - scaffold team → scaffold-dev agent
     - home/media team → dev agent
  6. When agents return:
     - PASS → set status = DONE, set completedAt in task-log.json
     - FAIL → increment retryCount
       - retryCount < 3 → re-spawn with error context appended to prompt
       - retryCount >= 3 → set status = ESCALATED, append to shared-context.md
  7. Update task-log.json after EVERY status change
  8. GOTO LOOP
```

---

## How to spawn a dev agent

Use `model="sonnet"` for all subagents.

```
Agent(
  description="[TASK-ID]: [short title]",
  model="sonnet",
  prompt="""
Read your full instructions at: .claude/agents/dev.md
Read shared decisions at: .workflow/state/shared-context.md

---

TASK BRIEF

ID: [TASK-ID]
Zone: apps/[zone]
Team: [home / media]
CSS prefix: [hm: / mda:]

Target files:
  - [exact paths to create or modify]

Existing files (read before implementing):
  - [paths that already exist and must be updated, not recreated]

Legacy reference (query `recall` MCP tool):
  - Query for: [component name] in vite-mf-monorepo
  - Understand: props, hooks, factory functions, CSS prefix, child components

Component type: [Server Component | Client Component ('use client')]
Reason for client: [useState / useQuery / event handlers — or N/A]
Factory function: [exact named export from @fubar-it-co/tmdb-client]
prefetchQuery in: [page.tsx path — or N/A if this task doesn't touch page.tsx]
useQuery in: [component path — or N/A if Server Component]
Initial prop: [prop name + default constant — or N/A]

Skills to invoke (via Skill tool) before implementing:
  - /next-best-practices
  - /vercel-react-best-practices
  [- /next-cache-components — if data fetching task]
  [- /vercel-composition-patterns — if @modal / intercepted route task]

Gate command:
  cd apps/[zone] && pnpm type-check && pnpm lint && pnpm test

Return format:
  RESULT: PASS | FAIL
  FILES: [list of created/modified files]
  DECISIONS: [any choices not explicit in the brief]
  ERRORS: [if FAIL — exact error output]
"""
)
```

---

## How to spawn a scaffold agent

```
Agent(
  description="[TASK-ID]: [short title]",
  model="sonnet",
  prompt="""
Read your full instructions at: .claude/agents/scaffold-dev.md
Read shared decisions at: .workflow/state/shared-context.md

---

TASK BRIEF

ID: [TASK-ID]
Zone: apps/[zone]
CSS prefix: [tl: / sr:]

Target files:
  - [exact paths to create]

Skills to invoke (via Skill tool) before implementing:
  - /next-best-practices

Gate command:
  cd apps/[zone] && pnpm type-check && pnpm lint

Return format:
  RESULT: PASS | FAIL
  FILES: [list of created files]
  ERRORS: [if FAIL — exact error output]
"""
)
```

---

## Batch execution plan

Phase 0 and Phase 1 Batch A run in parallel (no dependencies between them).

```
BATCH 1 — Phase 0 + H-1 (parallel, 3 agents)
  S-1  scaffold-dev  apps/talents — full scaffold
  S-2  scaffold-dev  apps/search  — full scaffold
  H-1  dev           apps/home   — QueryProvider, layout, error, not-found, types/home.ts

BATCH 2 — Home sections (parallel, 5 agents)
  H-2  dev  HeroSection
  H-3  dev  TrendingSection
  H-4  dev  PopularSection
  H-5  dev  FreeToWatchSection
  H-6  dev  FeaturedActorsSection

BATCH 3 — Home page + Media prerequisite (parallel, 2 agents)
  H-7  dev  page.tsx — prefetchQuery all + HydrationBoundary
  M-1  dev  QueryProvider + layout + error + globals.css + types/media.ts

BATCH 4 — Media structure + sections (parallel, 5 agents)
  M-2  dev  movie/[id]/layout + tv/[id]/layout — slot wiring + @modal/default.tsx
  M-3  dev  not-found + error pages
  M-4  dev  MediaHero
  M-5  dev  Synopsis
  M-6  dev  Crew

BATCH 5 — Media sections + PhotoViewer (parallel, 5 agents)
  M-7  dev  Cast
  M-8  dev  SimilarSection
  M-9  dev  RecommendedSection
  M-10 dev  TrailersSection
  P-1  dev  PhotoViewer component          ← unblocked: M-2 done in Batch 4

BATCH 6 — Media page + Photos pages (parallel, 4 agents)
  M-11 dev  movie/[id]/page.tsx + tv/[id]/page.tsx   ← unblocked: M-4..M-10 done
  P-2  dev  standalone photo pages                     ← unblocked: P-1 done
  P-3  dev  intercepted modal pages                    ← unblocked: P-1 done
  P-4  dev  BackdropSection                            ← unblocked: P-1 done

BATCH 7 — Verification
  P-5  → Flag for user: "Run the app and manually verify modal/standalone/back navigation"
```

Notes:
- H-7 and M-1 can run in parallel because M-1 has no dependency on home tasks
- P-1 only depends on M-2 — it starts in Batch 5 (not waiting for all M-* tasks)
- Batch 6 runs M-11 and P-2/P-3/P-4 in parallel — different dependency chains converge
- P-5 is manual verification, not an agent task
- 7 batches total (was 9 before optimization)

---

## Context management

After BATCH 5, check context usage. If above 60%:
- Save task-log.json with current state
- Tell the user: "Progress saved. Start a new conversation and say 'run the orchestrator' to continue from Batch 6."

task-log.json is the resume point. Any new conversation reads it and picks up exactly where it left off.

---

## Git strategy

After each completed phase (all tasks in that phase DONE):
- Propose a conventional commit via the /commit skill
- Wait for user approval before committing
- Phase 0: `feat(scaffold): add talents and search zone placeholders`
- Phase 1: `feat(home): implement all home zone sections with SSR prefetch`
- Phase 2: `feat(media): implement media zone with movie/tv detail pages`
- Phase 3: `feat(media): add photo viewer with intercepted route modal`

---

## Escalation protocol

1. After 3 failed retries → set status = ESCALATED
2. Append to shared-context.md: task ID, what failed, which file, what was attempted
3. Continue with unblocked tasks — never halt the pipeline for one failure
4. At the end, report all ESCALATED tasks to the user for manual resolution
5. If an ESCALATED task blocks other tasks → set those blocked tasks to status = BLOCKED

---

## Rules for brief writing

When composing the inline brief for each task:

1. Always specify exact file paths — never leave paths ambiguous
2. Always specify whether the component is Server or Client and why
3. Always specify the factory function name from @fubar-it-co/tmdb-client
4. Always list which skills the agent should invoke
5. For tasks that modify existing files: list the existing files under "Existing files"
   so the agent reads them first instead of overwriting blindly
6. For tasks with tabs (H-3, H-4, H-5): specify the initial prop name, type, and default constant
7. For media tasks: remind agent about CSS prefix `mda:` (easy to forget)
8. For photo tasks: remind about @modal folder name (exactly `@modal`) and (.) prefix
