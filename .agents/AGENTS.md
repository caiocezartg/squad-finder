# AGENTS.md

This file defines operating rules for agents in this repository.

## Project Context

- Product: SquadFinder (real-time app to complete squads/premades for multiplayer games).
- Main flow: Discord login, create/join rooms, invite link released when lobby is full.
- Frontend: React + Vite + TanStack Router (SPA).
- Backend: Fastify with Clean Architecture.
- Database: PostgreSQL + Drizzle ORM.
- Auth: Better Auth (Discord OAuth).
- Realtime: WebSocket/Socket.io.

## Essential Commands

- Infra (Postgres): `docker compose up -d` / `docker compose down`
- Root: `bun run dev`, `bun run build`, `bun run typecheck`, `bun run lint`, `bun run test`
- Client (`/client`): `bun dev`, `bun run build`, `bun run typecheck`, `bun run test`
- Server (`/server`): `bun dev`, `bun run build`, `bun run start`, `bun run typecheck`, `bun run test`
- DB (`/server`): `bun run db:push`, `bun run db:generate`, `bun run db:migrate`, `bun run db:studio`

## Technical Standards

- Language: strict TypeScript; avoid `any`.
- Validation: use Zod for DTOs and env vars.
- Formatting: Prettier (2 spaces).
- Imports: prefer absolute imports (`@/...`).
- Runtime/package manager: Bun.

## Frontend

- For interactive UI components (dialog, popover, tabs, etc.), use Base UI (`@base-ui-components/react`) as the foundation.
- Style with Tailwind using component `data-*` attributes.
- Build fully custom components only when Base UI does not cover the use case.

## Backend (Mandatory)

Follow Clean Architecture with strict separation:

1. Domain: entities and repository interfaces, no external dependencies.
2. Application: use cases and business rules, depends only on Domain.
3. Interface Adapters: controllers/presenters/serializers.
4. Infrastructure: Fastify, Drizzle, external integrations.

## Execution Workflow

1. Plan non-trivial tasks (3+ steps) before implementation.
2. If execution goes off track, stop and re-plan.
3. Verify before completion: tests, logs, and behavior.
4. Prioritize simplicity, minimal impact, and root-cause fixes.
5. For bugs: act autonomously and deliver complete fixes.

## Project Task Management

- Planning and status: `.agents/tasks/todo.md`
- Recurring lessons: `.agents/tasks/lessons.md`
- Legacy reference material (optional): `.claude/tasks/*.md`, `.claude/rules/*.md`

## Definition of Done

A task is complete only when:

- Implementation is consistent with the architecture and rules above.
- Relevant tests and validations were executed.
- The outcome was documented objectively.
