# Project Overview

**SquadFinder** — real-time web app connecting gamers to complete full teams (premades) for multiplayer games like LoL, Dota, and CS.

## Tech Stack

**Monorepo**: Turbo + Bun workspaces

| Scope     | Technologies                                                          |
| --------- | --------------------------------------------------------------------- |
| Server    | Fastify v5, Drizzle ORM, PostgreSQL, Better Auth, Zod                 |
| Client    | React 18, Vite, TanStack Router, TanStack Query, Tailwind CSS         |
| Shared    | `@squadfinder/types` (TS types), `@squadfinder/schemas` (Zod schemas) |
| Real-time | Fastify WebSocket plugin                                              |
| Auth      | Better Auth with Discord OAuth                                        |
| Testing   | Vitest (all workspaces)                                               |

## Project Structure

```
/server/src/
  domain/          # Entities + repository interfaces (no external deps)
  application/     # Use cases + DTOs (depends on domain only)
  infrastructure/  # Drizzle repos, WebSocket, auth, Fastify plugins
  interface/       # Controllers, routes, factories (DI wiring)
  config/          # Zod-validated env vars (env.ts)

/client/src/
  routes/          # TanStack Router pages (file-based routing)
  components/      # React UI (landing/, layout/, rooms/, ui/)
  hooks/           # Custom hooks (WebSocket, notifications, rooms)
  lib/             # API client, auth-client, ws-client, query-client

/packages/
  @squadfinder/types    # Shared TypeScript types (entities, DTOs, WS)
  @squadfinder/schemas  # Shared Zod schemas (rooms, users, WS messages)
```

## General Rules

- ALWAYS use `bun` instead of any package manager such as `npm`.
- NEVER violate the project's SOLID principles and Clean Architecture. Always analyze and review whether the logic is placed in the correct layer.
- Do not let functions become too large; break them into smaller, modular pieces.

## Architecture Rules

- **Dependency direction**: `interface → application → domain`. Infrastructure implements domain interfaces. Never import outward.
- **Use cases**: All business logic lives in `application/use-cases/`. They depend only on repository interfaces (domain layer), never on concrete Drizzle implementations.
- **Factories**: Dependency injection is wired in `interface/factories/`. This is the only place where concrete repositories are instantiated and injected into use cases.
- **DTOs**: Domain entities are pure interfaces. DTOs in `application/dtos/` handle cross-boundary data transfer.
- **Shared schemas**: Validation schemas used by both client and server live in `packages/@squadfinder/schemas`, not duplicated per workspace.

## Workflow Orchestration

### 1. Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy to keep main context window clean

- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run test (`bun run test`), lint (`bun run lint`), formatter (`bun run format`), check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests -> then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
