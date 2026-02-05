## Project Overview
SquadFinder is a real-time web application connecting gamers to complete full teams (premades) for multiplayer games like LoL, Dota, and CS.
- **Frontend:** React + Vite + TanStack Router (SPA).
- **Backend:** Fastify (Clean Architecture).
- **Goal:** Users login via Discord, find or create rooms, and get access to a Discord invite link once the lobby is full.

## Build & Run Commands
### Frontend (`/client`)
- **Install Dependencies:** `bun install`
- **Start Dev Server:** `bun dev`
- **Build:** `bun run build`
- **Lint:** `bun run lint`
- **Type Check:** `bun run tsc --noEmit`

### Backend (`/server`)
- **Install Dependencies:** `bun install`
- **Start Dev Server:** `bun dev` (Leverage `bun --watch` inside the script)
- **Database Migration:** `bunx drizzle-kit push` or `bunx drizzle-kit migrate`
- **Studio (DB GUI):** `bunx drizzle-kit studio`
- **Run Tests:** `bun test` (Using Bun's native test runner) or `bun run test` (if using Vitest)

## Tech Stack
- **Runtime & Package Manager:** Bun (v1.1+)
- **Language:** TypeScript (Strict mode)
- **Frontend:** React, Vite, TanStack Router, TanStack Query, Tailwind CSS
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
  - Use `Bun.env` for environment variables.
  - Use Bun's native test runner (`bun:test`) for unit tests if possible for speed.

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