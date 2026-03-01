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
  @/types    # Shared TypeScript types (entities, DTOs, WS)
  @/schemas  # Shared Zod schemas (rooms, users, WS messages)
```

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

## General Rules

- ALWAYS use `bun` instead of any package manager such as `npm`.
- NEVER violate the project's SOLID principles and Clean Architecture. Always analyze and review whether the logic is placed in the correct layer. See **Architectu Rules** section for more informations.
- Do not let functions become too large; break them into smaller, modular pieces.
- ALWAYS use Zod for schema creation and input validation throughout the codebase.
- For every completed task, always run the typecheck, lint, and format commands, and verify that there are no errors or warnings that need to be fixed.

## Architecture Rules

- **Dependency direction**: `interface → application → domain`. Infrastructure implements domain interfaces. Never import outward.
- **Use cases**: All business logic lives in `application/use-cases/`. They depend only on repository interfaces (domain layer), never on concrete Drizzle implementations.
- **Factories**: Dependency injection is wired in `interface/factories/`. This is the only place where concrete repositories are instantiated and injected into use cases.
- **DTOs**: Domain entities are pure interfaces. DTOs in `application/dtos/` handle cross-boundary data transfer.
- **Shared schemas**: Validation schemas used by both client and server live in `packages/@squadfinder/schemas`, not duplicated per workspace.

## Agents (only Claude Code)

Agents are located in `.claude/agents/` and should be used according to their specialization.

## Rules

Project rules are defined in `.agents/rules/` and MUST always be followed.

## Important Skills

- For any UI creation or modification, use the **frontend-design** skill.
- For any new library or provider implementation, use the **context7** skill.
- For landing page text creation, use the **copywriting** skill.
- For simulating user interaction with the browser, use the **playwright** skill.
- When working within the React ecosystem, use the **vercel-react-best-practices** skill.
