# SquadFinder - Task Progress

## Current Task: None

Ready for next task.

---

## Completed Tasks

### Database & Better Auth Integration (2026-02-05)
- [x] Docker Compose for PostgreSQL
- [x] Better Auth schema (user, session, account tables)
- [x] room_members schema with unique constraint
- [x] Better Auth config with Discord OAuth
- [x] DrizzleRoomRepository implementation
- [x] DrizzleRoomMemberRepository implementation
- [x] Updated DrizzleUserRepository for Better Auth user table
- [x] Auth plugin for Fastify
- [x] All 23 tests still passing

### Unit Testing + Use Cases (2026-02-05)
- [x] Test infrastructure: mocks directory, path aliases
- [x] RoomMember entity + IRoomMemberRepository
- [x] Room use cases: CreateRoom, GetRoomByCode, JoinRoom, LeaveRoom, GetAvailableRooms
- [x] User use cases: GetUser, CreateUser, UpdateUser
- [x] 23 tests passing

### Server Startup Fixes (2026-02-05)
- [x] Add --env-file flag to load environment variables
- [x] Simplify logger config (remove pino-pretty)
- [x] Verify server and client both work correctly

### Rename to SquadFinder (2026-02-05)
- [x] Change database name from `entra_pra_jogar` to `squad_finder`
- [x] Update "Entra Pra Jogar" to "SquadFinder" in client routes
- [x] Fix server tsconfig to include drizzle.config.ts

### Project Scaffolding (2026-02-05)
- [x] Set up Bun monorepo with workspaces
- [x] Create client package (React + Vite + TanStack + Tailwind)
- [x] Create server package (Fastify + Clean Architecture)
- [x] Create shared package (types + Zod schemas)
- [x] Configure TypeScript, ESLint, Prettier, Vitest
- [x] Set up WebSocket infrastructure
- [x] Push to GitHub
