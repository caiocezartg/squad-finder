## Project Overview

SquadFinder is a real-time web application connecting gamers to complete full teams (premades) for multiplayer games like LoL, Dota, and CS.

- **Frontend:** React + Vite + TanStack Router (SPA).
- **Backend:** Fastify (Clean Architecture).
- **Goal:** Users login via Discord, find or create rooms, and get access to a Discord invite link once the lobby is full.

## Build & Run Commands

### Infrastructure

- **Start PostgreSQL:** `docker compose up -d`
- **Stop PostgreSQL:** `docker compose down`

### Frontend (`/client`)

- **Install Dependencies:** `bun install`
- **Start Dev Server:** `bun dev`
- **Build:** `bun run build`
- **Preview Build:** `bun run preview`
- **Type Check:** `bun run typecheck`
- **Run Tests:** `bun run test`

### Backend (`/server`)

- **Install Dependencies:** `bun install`
- **Start Dev Server:** `bun dev` (loads `../.env` and watches for changes)
- **Build:** `bun run build`
- **Start Production:** `bun run start`
- **Type Check:** `bun run typecheck`
- **Run Tests:** `bun run test`

### Database (from `/server`)

- **Push Schema:** `bun run db:push` (sync schema to database)
- **Generate Migration:** `bun run db:generate`
- **Run Migrations:** `bun run db:migrate`
- **Open Studio:** `bun run db:studio` (GUI for database)

### Root (from `/`)

- **Start All Dev Servers:** `bun run dev` (client + server in parallel)
- **Start Client Only:** `bun run dev:client`
- **Start Server Only:** `bun run dev:server`
- **Build All:** `bun run build`
- **Type Check All:** `bun run typecheck`
- **Lint:** `bun run lint`
- **Lint & Fix:** `bun run lint:fix`
- **Format:** `bun run format`
- **Run Tests:** `bun run test`
- **Run Tests (Watch):** `bun run test:watch`
- **Database:** `bun run db:push`, `bun run db:migrate`, `bun run db:studio`

## Tech Stack

- **Runtime & Package Manager:** Bun (v1.1+)
- **Language:** TypeScript (Strict mode)
- **Frontend:** React, Vite, TanStack Router, TanStack Query, Tailwind CSS, Base UI (`@base-ui-components/react`)
- **Backend:** Fastify
- **Database:** PostgreSQL, Drizzle ORM.
- **Auth:** Better Auth (Discord OAuth).
- **Real-time:** Fastify-websocket / Socket.io.
- **Validation:** Zod

## Architecture & Code Style

### General Guidelines

- **TypeScript:** Use strict typing. Avoid `any`. Use Zod for runtime validation (DTOs/Env vars).
- **Formatting:** Prettier default settings. 2 spaces indentation.
- **Imports:** Absolute imports (e.g., `@/domain/...`) preferred over relative.
- **Bun Specifics:**
  - Use `Bun.env` or `process.env` for environment variables.
  - Use Vitest for unit tests (`bun run test` in both client and server).

### Frontend: Base UI First

For any interactive UI component (accordion, dialog, popover, tooltip, select, menu, tabs, collapsible, etc.), always use **Base UI** (`@base-ui-components/react`) as the headless foundation:

1. Check if Base UI has a primitive for the component before building custom logic
2. Style with Tailwind CSS using Base UI's `data-*` attributes (`data-panel-open`, `data-starting-style`, `data-ending-style`, etc.)
3. Only build fully custom components when Base UI does not cover the use case

### Backend: Clean Architecture (SOLID)

The backend must strictly follow Clean Architecture principles.

1.  **Domain Layer:** Pure business logic. Entities and Repository Interfaces only. No external dependencies.
2.  **Application Layer:** Use Cases (Service classes). Implements business rules. Depends only on Domain.
3.  **Interface Adapters:** Controllers, Presenters, Serializers. Converts data between Web and Application layers.
4.  **Infrastructure:** Frameworks (Fastify), Database (Drizzle), External APIs (Discord). Implements Repository Interfaces.

## Workflow Orchestration

### 1. Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes side ways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update 'tasks/lessons.md' with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

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

1. **Plan First**: Write plan to `.claude/tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review to `.claude/tasks/todo.md`
6. **Capture Lessons**: Update `.claude/tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
