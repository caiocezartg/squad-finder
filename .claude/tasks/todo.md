# SquadFinder - Task Progress

## Completed Tasks

### Frontend Redesign with Dark Theme (2026-02-08)
- [x] Add `discordLink` field to Room entity (domain, DB schema, types, schemas, repository, controller, use case)
- [x] Update mock room factory and all 23 tests pass
- [x] Install `@base-ui-components/react` and `motion` (motion.dev)
- [x] Add Google Fonts (Exo 2 for headings, Plus Jakarta Sans for body)
- [x] Dark theme Tailwind config (background #0A0A0B, accent #00FFA2, custom color palette)
- [x] Redesigned `globals.css` with `.btn-accent`, `.btn-ghost`, `.btn-danger`, `.card`, `.card-hover`, `.badge-accent`, `.input-field`
- [x] Root layout: glassmorphism navbar with `backdrop-blur-xl`, user dropdown menu, Discord sign-in
- [x] Landing page: Hero with animated heading (Motion), How It Works 3-step cards, Popular Games grid (TanStack Query), CTA banner
- [x] Rooms page: search by game/room name, filter chips (All, Has Space, Almost Full), sort (Newest/Oldest), responsive 3-column grid
- [x] Create Room modal: Base UI Dialog with fields for name, game, max players, Discord link
- [x] Room lobby: game cover blurred background header, player slots grid with empty placeholders, Discord link card with copy button
- [x] Updated AlertBox (dark theme with icons) and ConnectionStatus (minimal dot indicator)
- [x] New components: `HeroSection`, `HowItWorks`, `PopularGames`, `CTABanner`, `RoomFilters`, `CreateRoomModal`, `EmptyState`, `PlayerSlot`, `DiscordLinkCard`
- [x] New hooks: `useTimeAgo` (relative time with auto-refresh)
- [x] Rooms page now public (no auth required to view, only to create/join)
- [x] All 23 tests passing, typecheck pass, lint pass (0 errors, 0 warnings)

### Phase 3 - WebSocket Real-time (2026-02-07)
- [x] Add WebSocket authentication via session cookie (`ws.plugin.ts` checks `request.session`)
- [x] Update room handler to validate room exists in database (`DrizzleRoomRepository.findByCode()`)
- [x] Fetch real player data (name, avatar, isHost) from database (`DrizzleUserRepository`)
- [x] Add `room_ready` message type for full rooms (`roomReadyMessageSchema` in `types.ts`)
- [x] Emit `room_ready` when room reaches maxPlayers (`handleJoinRoom` broadcasts when full)
- [x] Lobby subscription system (`subscribe_lobby`, `room_created`, `room_deleted` broadcasts)
- [x] Test WebSocket flow end-to-end

### Swagger API Documentation with Scalar (2026-02-08)
- [x] Install `fastify-type-provider-zod@6`, `@fastify/swagger@9`, `@scalar/fastify-api-reference`
- [x] Update Zod to v4 across all packages (server, client, schemas)
- [x] Fix `ZodError.errors` → `ZodError.issues` in error handler (Zod v4 breaking change)
- [x] Create `swagger.plugin.ts` (validator/serializer compilers + OpenAPI config + Scalar UI)
- [x] Add Zod route schemas to all endpoints (health, games, rooms, users)
- [x] Define response schemas, error schemas, security schemes (session cookie)
- [x] Scalar UI available at `/reference`
- [x] All 23 tests passing, typecheck pass, lint pass

### Turborepo Package Restructuring (2026-02-07)
- [x] Create `packages/typescript-config/` with `base.json`, `react.json`, `server.json`
- [x] Create `packages/types/` — pure TS types (domain, API, WS) as `@squadfinder/types`
- [x] Create `packages/schemas/` — Zod validation schemas as `@squadfinder/schemas`
- [x] Delete `packages/shared/` (split into types + schemas)
- [x] Delete root `tsconfig.base.json` (moved to `packages/typescript-config/base.json`)
- [x] Update `client/tsconfig.json` → extends `@squadfinder/typescript-config/react.json`
- [x] Update `server/tsconfig.json` → extends `@squadfinder/typescript-config/server.json`
- [x] Remove all `@shared/*` tsconfig path aliases and Vite alias
- [x] Update imports: `@squadfinder/shared/types` → `@squadfinder/types`, `@squadfinder/shared/schemas` → `@squadfinder/schemas`
- [x] Update consumer `package.json` deps (`@squadfinder/types`, `@squadfinder/schemas`, `@squadfinder/typescript-config`)
- [x] All 23 tests passing, all 4 packages typecheck pass

### Turborepo Integration (2026-02-07)
- [x] Install `turbo` as root dev dependency (v2.8.3)
- [x] Create `turbo.json` with task config (build, dev, typecheck, test, lint, db:*)
- [x] Add `@squadfinder/shared` as `workspace:*` dependency to client and server
- [x] Update root `package.json` scripts to use `turbo` instead of `bun run --filter`
- [x] Add `packageManager` field to root `package.json`
- [x] Add `.turbo/` to `.gitignore`
- [x] Fix client test script (`--passWithNoTests` for empty test suites)
- [x] Verified: turbo cache working (2 cached, 1 total on second typecheck run)
- [x] All 23 tests passing, all typechecks pass

### Phase 4.5 - Shared Package Consolidation (2026-02-07)
- [x] Fix server tsconfig `@shared` path (was pointing to `src/shared/` instead of `../packages/shared/src/*`)
- [x] Create `packages/shared/src/types/api.ts` (API response types: RoomsResponse, RoomResponse, etc.)
- [x] Create `packages/shared/src/types/ws.ts` (WebSocket payload types: Player, RoomJoinedPayload, etc.)
- [x] Update shared package barrel exports (`types/index.ts`, `index.ts`)
- [x] Remove duplicate schemas from `server/src/application/dtos/room.dto.ts` (now imports from shared)
- [x] Remove duplicate `roomDataSchema` from `server/src/infrastructure/websocket/types.ts` (uses shared `roomSchema`)
- [x] Add custom error messages to shared `createRoomInputSchema`
- [x] Update `client/src/types/index.ts` to re-export from shared (single source of truth)
- [x] All 23 tests passing, both client and server typecheck pass

### Phase 4 - Client Refactoring (2026-02-07)
- [x] Create `client/src/types/index.ts` with shared types
- [x] Create `hooks/use-message-log.ts` (WebSocket log with timestamps)
- [x] Create `hooks/use-rooms-cache.ts` (TanStack Query cache operations)
- [x] Create `hooks/use-lobby-events.ts` (lobby WebSocket subscription)
- [x] Create `components/ui/AlertBox.tsx` (error/success/warning alerts)
- [x] Create `components/ui/ConnectionStatus.tsx` (WS connection badge)
- [x] Create `components/rooms/RoomCard.tsx` (room card with join button)
- [x] Create `components/rooms/CreateRoomForm.tsx` (room creation form)
- [x] Create `components/rooms/PlayersList.tsx` (player list with host badge)
- [x] Create `components/rooms/RoomHeader.tsx` (room header with status)
- [x] Create `components/rooms/WebSocketLog.tsx` (terminal-style WS log)
- [x] Refactor `routes/rooms/index.tsx` (304 → 128 lines, -58%)
- [x] Refactor `routes/rooms/$code.tsx` (302 → 175 lines, -42%)
- [x] Fix WebSocket room deletion for host (cache update on leave)
- [x] Clean up debug console.log statements
- [x] All tests passing, typecheck pass

### Phase 2 - API Routes & Clean Architecture Refactor (2026-02-06)
- [x] Create Game entity and repository interface
- [x] Create games schema and DrizzleGameRepository
- [x] Update Room entity and schema to include gameId
- [x] Create games seed script (19 games with IGDB covers)
- [x] Push database changes and seed data
- [x] Create auth guard hook (`requireAuth`)
- [x] Create DTOs with Zod validation (Room, Game)
- [x] Create centralized AppError classes with HTTP status codes
- [x] Add global error handler plugin
- [x] Create controllers following Clean Architecture (Room, Game, User)
- [x] Create simplified routes wiring to controllers
- [x] Fix room code generation duplication (kept in repository only)
- [x] Update use cases to use centralized errors
- [x] Update lessons.md with learnings
- [x] Create business rules documentation
- [x] All 24 tests passing

**API Endpoints:**
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/games` | No | List all games |
| GET | `/api/rooms` | No | List available rooms |
| GET | `/api/rooms/:code` | No | Get room by code |
| POST | `/api/rooms` | Yes | Create room |
| POST | `/api/rooms/:code/join` | Yes | Join room |
| POST | `/api/rooms/:code/leave` | Yes | Leave room |
| GET | `/api/users/me` | Yes | Get current user |

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