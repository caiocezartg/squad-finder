# SquadFinder - Task Progress

## Current Task

### Codebase Refactoring — SOLID / Clean Architecture Cleanup (2026-02-21)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate SOLID/Clean Architecture violations, extract scattered magic constants, add HTTP-layer integration tests, and add toast-based error feedback on the client — without altering any business logic.

**Architecture:** Fix-First approach: backend violations are corrected before tests are written, so integration tests validate clean code. Client Sonner integration delivers consistent user-facing error messages. No new features.

**Tech Stack:** Bun · TypeScript strict · Fastify 5 · Drizzle ORM · Vitest · React 18 · TanStack Query · Sonner

---

#### Task 1: Extract Magic Constants

**Problem:** `ROOM_CREATE_LIMIT`, `ROOM_JOIN_LIMIT`, `CLEANUP_INTERVAL_MS`, `EXPIRATION_MINUTES` are hardcoded inline in use-case and plugin files.

**Files:**
- Create: `server/src/config/constants.ts`
- Modify: `server/src/application/use-cases/room/create-room.use-case.ts` (line 8)
- Modify: `server/src/application/use-cases/room/join-room.use-case.ts` (line 11)
- Modify: `server/src/infrastructure/plugins/room-cleanup.plugin.ts` (lines 7-8)

**Step 1.1:** Create `server/src/config/constants.ts`:
```typescript
/** Maximum number of active rooms a user can host simultaneously. */
export const ROOM_CREATE_LIMIT = 3

/** Maximum number of active rooms a user can be a member of simultaneously. */
export const ROOM_JOIN_LIMIT = 5

/** Interval (ms) between room cleanup runs. */
export const CLEANUP_INTERVAL_MS = 60_000

/** Time (minutes) after completedAt before a room is deleted. */
export const ROOM_EXPIRATION_MINUTES = 60
```

**Step 1.2:** In `create-room.use-case.ts`, replace `const ROOM_CREATE_LIMIT = 3` with:
```typescript
import { ROOM_CREATE_LIMIT } from '@config/constants'
```

**Step 1.3:** In `join-room.use-case.ts`, replace `const ROOM_JOIN_LIMIT = 5` with:
```typescript
import { ROOM_JOIN_LIMIT } from '@config/constants'
```

**Step 1.4:** In `room-cleanup.plugin.ts`, replace the two inline consts with:
```typescript
import { CLEANUP_INTERVAL_MS, ROOM_EXPIRATION_MINUTES } from '@config/constants'
```
Update the `useCase.execute` call argument from `EXPIRATION_MINUTES` to `ROOM_EXPIRATION_MINUTES`.

**Step 1.5:** `cd server && bun run typecheck` → 0 errors

**Step 1.6:** `cd server && bun run test` → all pass

**Step 1.7:** Commit:
```bash
git add server/src/config/constants.ts \
        server/src/application/use-cases/room/create-room.use-case.ts \
        server/src/application/use-cases/room/join-room.use-case.ts \
        server/src/infrastructure/plugins/room-cleanup.plugin.ts
git commit -m "refactor(config): extract magic constants to config/constants.ts"
```

- [ ] Task 1 complete

---

#### Task 2: Fix WebSocket Handler DI Violation

**Problem:** `room.handler.ts:87-89` directly instantiates `DrizzleRoomRepository`, `DrizzleRoomMemberRepository`, and `DrizzleUserRepository` inside `handleJoinRoom`. `handleLeaveRoom` receives `_db` it never uses. This bypasses the factory/DI pattern.

**Files:**
- Create: `server/src/interface/factories/ws.factory.ts`
- Modify: `server/src/infrastructure/websocket/handlers/room.handler.ts`
- Modify: `server/src/infrastructure/websocket/ws.plugin.ts`

**Step 2.1:** Create `server/src/interface/factories/ws.factory.ts`:
```typescript
import type { Database } from '@infrastructure/database/drizzle'
import { DrizzleRoomRepository } from '@infrastructure/repositories/drizzle-room.repository'
import { DrizzleRoomMemberRepository } from '@infrastructure/repositories/drizzle-room-member.repository'
import { DrizzleUserRepository } from '@infrastructure/repositories/drizzle-user.repository'
import type { IRoomRepository } from '@domain/repositories/room.repository'
import type { IRoomMemberRepository } from '@domain/repositories/room-member.repository'
import type { IUserRepository } from '@domain/repositories/user.repository'

export interface WsHandlerDeps {
  roomRepository: IRoomRepository
  roomMemberRepository: IRoomMemberRepository
  userRepository: IUserRepository
}

export function createWsHandlerDeps(db: Database): WsHandlerDeps {
  return {
    roomRepository: new DrizzleRoomRepository(db),
    roomMemberRepository: new DrizzleRoomMemberRepository(db),
    userRepository: new DrizzleUserRepository(db),
  }
}
```

**Step 2.2:** In `room.handler.ts`:
- Remove infrastructure imports (lines 3-5: `DrizzleRoomRepository`, `DrizzleRoomMemberRepository`, `DrizzleUserRepository`)
- Remove `import type { Database } from '@infrastructure/database/drizzle'`
- Add: `import type { WsHandlerDeps } from '@interface/factories/ws.factory'`
- Change `handleJoinRoom(socket, message, db: Database)` → `handleJoinRoom(socket, message, deps: WsHandlerDeps)`
- Replace lines 87-89 (the three `new Drizzle*` calls) with: `const { roomRepository, roomMemberRepository, userRepository } = deps`
- Change `handleLeaveRoom(socket, message, _db: Database)` → `handleLeaveRoom(socket, message)`

**Step 2.3:** In `ws.plugin.ts`:
- Add: `import { createWsHandlerDeps } from '@interface/factories/ws.factory'`
- After `const db = fastify.db` (line 49), add: `const wsDeps = createWsHandlerDeps(db)`
- Change `handleJoinRoom(socket, message, db)` → `handleJoinRoom(socket, message, wsDeps)`
- Change `handleLeaveRoom(socket, message, db)` → `handleLeaveRoom(socket, message)`

**Step 2.4:** `cd server && bun run typecheck` → 0 errors

**Step 2.5:** `cd server && bun run test` → all pass

**Step 2.6:** Commit:
```bash
git add server/src/interface/factories/ws.factory.ts \
        server/src/infrastructure/websocket/handlers/room.handler.ts \
        server/src/infrastructure/websocket/ws.plugin.ts
git commit -m "refactor(websocket): inject repository deps into WS handlers via factory"
```

- [ ] Task 2 complete

---

#### Task 3: Atomic Room Completion

**Problem:** `join-room.use-case.ts:74-78` makes two separate DB calls when a room becomes full (`update(completedAt)` and `markReadyNotified()`). A failure between them leaves the room in a partially-completed state. Fix: merge both into a single `markCompleted` method that does one UPDATE setting both columns atomically.

**Files:**
- Read first: `server/src/domain/repositories/room.repository.ts`
- Read first: `server/src/infrastructure/repositories/drizzle-room.repository.ts`
- Modify: `server/src/domain/repositories/room.repository.ts`
- Modify: `server/src/infrastructure/repositories/drizzle-room.repository.ts`
- Modify: `server/src/application/use-cases/room/join-room.use-case.ts`
- Modify (if needed): `server/src/test/mocks/room.repository.mock.ts`

**Step 3.1:** Read both repository files to understand the existing signatures.

**Step 3.2:** In `room.repository.ts` interface, add:
```typescript
/** Atomically sets completedAt and readyNotifiedAt in a single operation. */
markCompleted(roomId: string, now: Date): Promise<void>
```

**Step 3.3:** In `drizzle-room.repository.ts`, add implementation:
```typescript
async markCompleted(roomId: string, now: Date): Promise<void> {
  await this.db
    .update(rooms)
    .set({ completedAt: now, readyNotifiedAt: now })
    .where(eq(rooms.id, roomId))
}
```

**Step 3.4:** In `join-room.use-case.ts`, replace lines 74-79:
```typescript
// Before:
if (isRoomNowFull) {
  await this.roomRepository.update(input.roomId, { completedAt: new Date() })
  await this.roomRepository.markReadyNotified(input.roomId, new Date())
}
// After:
if (isRoomNowFull) {
  await this.roomRepository.markCompleted(input.roomId, new Date())
}
```

**Step 3.5:** `cd server && bun run test` — if join-room tests fail because mock is missing `markCompleted`, add to `room.repository.mock.ts`:
```typescript
markCompleted: vi.fn().mockResolvedValue(undefined),
```

**Step 3.6:** `cd server && bun run typecheck` → 0 errors, `bun run test` → all pass

**Step 3.7:** Commit:
```bash
git add server/src/domain/repositories/room.repository.ts \
        server/src/infrastructure/repositories/drizzle-room.repository.ts \
        server/src/application/use-cases/room/join-room.use-case.ts \
        server/src/test/mocks/room.repository.mock.ts
git commit -m "refactor(room): merge completedAt+readyNotifiedAt into atomic markCompleted"
```

- [ ] Task 3 complete

---

#### Task 4: Backend Integration Test Infrastructure

**Goal:** Create a reusable test server using Fastify's `inject()` that exercises routes → controllers → use cases → repositories → DB. Auth is mocked.

**Files:**
- Create: `server/src/test/helpers/build-test-app.ts`

**Step 4.1:** Read `server/src/index.ts` to confirm plugin registration order.

**Step 4.2:** Create `server/src/test/helpers/build-test-app.ts`:
```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import errorHandlerPlugin from '@infrastructure/plugins/error-handler.plugin'
import databasePlugin from '@infrastructure/plugins/database.plugin'
import swaggerPlugin from '@infrastructure/plugins/swagger.plugin'
import wsPlugin from '@infrastructure/websocket/ws.plugin'
import { registerRoutes } from '@interface/routes'

export async function buildTestApp(authenticatedUserId?: string) {
  const app = Fastify({ logger: false })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  await app.register(errorHandlerPlugin)
  await app.register(cors, { origin: true, credentials: true })
  await app.register(websocket)
  await app.register(swaggerPlugin)
  await app.register(databasePlugin)

  // Mock auth: inject userId into request so requireAuth passes
  app.addHook('preHandler', async (request) => {
    if (authenticatedUserId) {
      ;(request as any).userId = authenticatedUserId
      ;(request as any).session = { user: { id: authenticatedUserId } }
    }
  })

  await app.register(wsPlugin)
  await registerRoutes(app)
  await app.ready()
  return app
}
```

**Step 4.3:** `cd server && bun run typecheck` → 0 errors

**Step 4.4:** Commit:
```bash
git add server/src/test/helpers/build-test-app.ts
git commit -m "test(infra): add buildTestApp helper for route integration tests"
```

- [ ] Task 4 complete

---

#### Task 5: Room Route Integration Tests

**Files:**
- Read first: `server/src/interface/routes/room.routes.ts`
- Create: `server/src/interface/routes/room.routes.test.ts`

**Step 5.1:** Read `room.routes.ts` to confirm endpoint paths and response shapes.

**Step 5.2:** Create `server/src/interface/routes/room.routes.test.ts`:
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildTestApp } from '@test/helpers/build-test-app'
import type { FastifyInstance } from 'fastify'

describe('GET /api/rooms', () => {
  let app: FastifyInstance
  beforeAll(async () => { app = await buildTestApp() })
  afterAll(async () => { await app.close() })

  it('returns 200 with rooms array', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/rooms' })
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.json<{ rooms: unknown[] }>().rooms)).toBe(true)
  })
})

describe('GET /api/rooms/my — unauthenticated', () => {
  let app: FastifyInstance
  beforeAll(async () => { app = await buildTestApp() })
  afterAll(async () => { await app.close() })

  it('returns 401', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/rooms/my' })
    expect(res.statusCode).toBe(401)
  })
})

describe('GET /api/rooms/:code', () => {
  let app: FastifyInstance
  beforeAll(async () => { app = await buildTestApp() })
  afterAll(async () => { await app.close() })

  it('returns 404 for non-existent code', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/rooms/ZZZZZZ' })
    expect(res.statusCode).toBe(404)
    expect(res.json<{ error: string }>().error).toBeDefined()
  })
})

describe('POST /api/rooms — unauthenticated', () => {
  let app: FastifyInstance
  beforeAll(async () => { app = await buildTestApp() })
  afterAll(async () => { await app.close() })

  it('returns 401', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/rooms',
      payload: { name: 'Test', gameId: 'fake', discordLink: 'https://discord.gg/test' },
    })
    expect(res.statusCode).toBe(401)
  })
})

describe('POST /api/rooms/:code/join — unauthenticated', () => {
  let app: FastifyInstance
  beforeAll(async () => { app = await buildTestApp() })
  afterAll(async () => { await app.close() })

  it('returns 401', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/rooms/AAAAAA/join' })
    expect(res.statusCode).toBe(401)
  })
})

describe('POST /api/rooms/:code/leave — unauthenticated', () => {
  let app: FastifyInstance
  beforeAll(async () => { app = await buildTestApp() })
  afterAll(async () => { await app.close() })

  it('returns 401', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/rooms/AAAAAA/leave' })
    expect(res.statusCode).toBe(401)
  })
})
```

**Step 5.3:** `cd server && bun run test src/interface/routes/room.routes.test.ts` → all pass

**Step 5.4:** Commit:
```bash
git add server/src/interface/routes/room.routes.test.ts
git commit -m "test(routes): add room route integration tests"
```

- [ ] Task 5 complete

---

#### Task 6: User + Game + Health Route Integration Tests

**Files:**
- Read first: `server/src/interface/routes/user.routes.ts`, `server/src/interface/routes/health.routes.ts`
- Create: `server/src/interface/routes/user.routes.test.ts`
- Create: `server/src/interface/routes/game.routes.test.ts`
- Create: `server/src/interface/routes/health.routes.test.ts`

**Step 6.1:** Read user and health route files for endpoint paths.

**Step 6.2:** Create `user.routes.test.ts`:
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildTestApp } from '@test/helpers/build-test-app'
import type { FastifyInstance } from 'fastify'

describe('GET /api/users/me — unauthenticated', () => {
  let app: FastifyInstance
  beforeAll(async () => { app = await buildTestApp() })
  afterAll(async () => { await app.close() })

  it('returns 401', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/users/me' })
    expect(res.statusCode).toBe(401)
  })
})

describe('GET /api/users/notifications — unauthenticated', () => {
  let app: FastifyInstance
  beforeAll(async () => { app = await buildTestApp() })
  afterAll(async () => { await app.close() })

  it('returns 401', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/users/notifications' })
    expect(res.statusCode).toBe(401)
  })
})
```

**Step 6.3:** Create `game.routes.test.ts`:
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildTestApp } from '@test/helpers/build-test-app'
import type { FastifyInstance } from 'fastify'

describe('GET /api/games', () => {
  let app: FastifyInstance
  beforeAll(async () => { app = await buildTestApp() })
  afterAll(async () => { await app.close() })

  it('returns 200 with games array', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/games' })
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.json<{ games: unknown[] }>().games)).toBe(true)
  })
})
```

**Step 6.4:** Create `health.routes.test.ts`:
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildTestApp } from '@test/helpers/build-test-app'
import type { FastifyInstance } from 'fastify'

describe('Health routes', () => {
  let app: FastifyInstance
  beforeAll(async () => { app = await buildTestApp() })
  afterAll(async () => { await app.close() })

  it('GET /health returns 200', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' })
    expect(res.statusCode).toBe(200)
    expect(res.json<{ status: string }>().status).toBe('ok')
  })

  it('GET /health/ready returns 200 when DB connected', async () => {
    const res = await app.inject({ method: 'GET', url: '/health/ready' })
    expect(res.statusCode).toBe(200)
  })
})
```

**Step 6.5:** `cd server && bun run test` → all pass

**Step 6.6:** Commit:
```bash
git add server/src/interface/routes/user.routes.test.ts \
        server/src/interface/routes/game.routes.test.ts \
        server/src/interface/routes/health.routes.test.ts
git commit -m "test(routes): add user, game, and health route integration tests"
```

- [ ] Task 6 complete

---

#### Task 7: Install Sonner + Toast Infrastructure (Client)

**Files:**
- Modify: `client/package.json` (via bun add)
- Modify: `client/src/routes/__root.tsx`
- Modify: `client/src/lib/api.ts`

**Step 7.1:** Install Sonner:
```bash
cd client && bun add sonner
```

**Step 7.2:** In `client/src/routes/__root.tsx`, add import:
```typescript
import { Toaster } from 'sonner'
```
Add `<Toaster>` just before the closing `</div>` of the root layout return:
```tsx
<Toaster
  position="bottom-right"
  toastOptions={{
    classNames: {
      toast: 'bg-surface border border-border text-offwhite',
      error: 'border-red-500/30',
      success: 'border-accent/30',
    },
  }}
/>
```

**Step 7.3:** In `client/src/lib/api.ts`, add at the top:
```typescript
import { toast } from 'sonner'
```
After the `ApiClientError` class, add:
```typescript
export function handleApiError(error: unknown): void {
  if (error instanceof ApiClientError) {
    switch (error.status) {
      case 401:
        toast.error('Sign in to continue')
        break
      case 404:
        toast.error('Not found')
        break
      case 409:
        toast.error(error.message || 'Already exists')
        break
      case 422:
        toast.error(error.message || 'Action not allowed')
        break
      default:
        toast.error(error.message || 'Something went wrong')
    }
    return
  }
  toast.error('Something went wrong')
}
```
Also export `ApiClientError` (add to the bottom or where class is defined):
```typescript
export { ApiClientError }
```

**Step 7.4:** `cd client && bun run typecheck` → 0 errors

**Step 7.5:** Commit:
```bash
git add client/package.json client/src/routes/__root.tsx client/src/lib/api.ts bun.lock
git commit -m "feat(ui): add sonner toast infrastructure and handleApiError utility"
```

- [ ] Task 7 complete

---

#### Task 8: Wire Toast Error Handling into Mutation Hooks

**Step 8.1:** Find all error handlers in the client:
```bash
grep -rn "onError\|\.catch\|console\.error" client/src --include="*.ts" --include="*.tsx"
```
Review output to identify which files use inline error handling.

**Step 8.2:** For each identified file, replace inline error handling with:
```typescript
import { handleApiError } from '@/lib/api'
// ...
onError: (error) => {
  handleApiError(error)
}
```

**Step 8.3:** `cd client && bun run typecheck` → 0 errors
`cd client && bun run lint` → 0 errors

**Step 8.4:** Commit:
```bash
git add -p  # stage only changed client hook/component files
git commit -m "feat(ui): wire handleApiError into mutation onError callbacks"
```

- [ ] Task 8 complete

---

#### Task 9: Remove passWithNoTests + Add Minimal Client Tests

**Files:**
- Modify: `client/package.json`
- Create: `client/src/lib/api.test.ts`

**Step 9.1:** In `client/package.json`, change:
```json
"test": "vitest run --passWithNoTests"
```
to:
```json
"test": "vitest run"
```

**Step 9.2:** Create `client/src/lib/api.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/env', () => ({ env: { VITE_API_URL: 'http://localhost:3000' } }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

import { handleApiError, ApiClientError } from './api'
import { toast } from 'sonner'

describe('handleApiError', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows "Sign in to continue" for 401', () => {
    handleApiError(new ApiClientError('Unauthorized', 401))
    expect(toast.error).toHaveBeenCalledWith('Sign in to continue')
  })

  it('shows "Not found" for 404', () => {
    handleApiError(new ApiClientError('Not Found', 404))
    expect(toast.error).toHaveBeenCalledWith('Not found')
  })

  it('shows the error message for 422', () => {
    handleApiError(new ApiClientError('Room is full', 422))
    expect(toast.error).toHaveBeenCalledWith('Room is full')
  })

  it('shows generic message for unknown errors', () => {
    handleApiError(new Error('network failure'))
    expect(toast.error).toHaveBeenCalledWith('Something went wrong')
  })
})
```

**Step 9.3:** `cd client && bun run test` → 4 tests pass

**Step 9.4:** `bun run test` (root) → all server and client tests pass

**Step 9.5:** Commit:
```bash
git add client/package.json client/src/lib/api.test.ts
git commit -m "test(client): remove passWithNoTests and add handleApiError unit tests"
```

- [ ] Task 9 complete

---

#### Task 10: Final Verification

**Step 10.1:** `bun run typecheck` → 0 errors (all packages)
**Step 10.2:** `bun run lint` → 0 errors
**Step 10.3:** `bun run test` → all tests pass
**Step 10.4:** Confirm business rules unchanged (magic numbers are the same values, just in constants.ts)

- [ ] Task 10 complete

---

## Completed Tasks

### My Rooms — Tab Switcher UI (2026-02-20)

**Goal:** Replace the two stacked sections on `/rooms/my` with a Base UI tab switcher showing "Created (N)" and "Joined (N)" tabs.

**Architecture:** Single-file change in `client/src/routes/rooms/my.tsx`. Use `@base-ui-components/react` Tabs primitive. Tab counts show unfiltered totals. Filters apply to whichever tab is active.

---

#### Task 1: Replace two-section layout with Base UI Tabs

**File:** `client/src/routes/rooms/my.tsx`

**Step 1.1: Import Tabs from Base UI**

Add to imports:
```typescript
import { Tabs } from '@base-ui-components/react'
```

**Step 1.2: Add unfiltered count variables** (right before the `return` statement):
```typescript
const hostedCount = myRoomsData?.hosted.length ?? 0
const joinedCount = myRoomsData?.joined.length ?? 0
```

**Step 1.3: Replace the two `<section>` elements** with a `Tabs.Root` block. The full replacement (swap out lines from `{/* Rooms I Created */}` through the end of `{/* Rooms I Joined */}` closing tag):

```tsx
<Tabs.Root defaultValue="created" className="mt-6">
  {/* Tab list */}
  <Tabs.List className="flex gap-1 border-b border-white/10 mb-6">
    <Tabs.Tab
      value="created"
      className="px-4 py-2.5 text-sm font-medium text-white/50 transition-colors cursor-pointer
                 data-[selected]:text-accent data-[selected]:border-b-2 data-[selected]:border-accent
                 hover:text-white/80 -mb-px outline-none"
    >
      Created ({hostedCount})
    </Tabs.Tab>
    <Tabs.Tab
      value="joined"
      className="px-4 py-2.5 text-sm font-medium text-white/50 transition-colors cursor-pointer
                 data-[selected]:text-accent data-[selected]:border-b-2 data-[selected]:border-accent
                 hover:text-white/80 -mb-px outline-none"
    >
      Joined ({joinedCount})
    </Tabs.Tab>
  </Tabs.List>

  {/* Created panel */}
  <Tabs.Panel value="created">
    {filteredHosted.length === 0 ? (
      <p className="text-white/40 text-sm py-6">
        {hasActiveFilters ? 'No rooms match your filters.' : 'No rooms here yet.'}
      </p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHosted.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            game={gamesMap.get(room.gameId)}
            onJoin={(code) => {
              navigate({ to: '/rooms/$code', params: { code } })
            }}
            isLoading={false}
            currentMembers={room.memberCount}
          />
        ))}
      </div>
    )}
  </Tabs.Panel>

  {/* Joined panel */}
  <Tabs.Panel value="joined">
    {filteredJoined.length === 0 ? (
      <p className="text-white/40 text-sm py-6">
        {hasActiveFilters ? 'No rooms match your filters.' : 'No rooms here yet.'}
      </p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJoined.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            game={gamesMap.get(room.gameId)}
            onJoin={(code) => {
              navigate({ to: '/rooms/$code', params: { code } })
            }}
            isLoading={false}
            currentMembers={room.memberCount}
          />
        ))}
      </div>
    )}
  </Tabs.Panel>
</Tabs.Root>
```

**Step 1.4:** Remove the `mb-10` class from the outer wrapper of the first section (since sections no longer exist, only the `Tabs.Root` wrapper). The `Tabs.Root` has `mt-6` instead.

**Step 1.5:** Run `bun run typecheck` from client → 0 errors

**Step 1.6:** Run `bun run lint` from root → 0 errors

**Step 1.7:** Commit:
```bash
git add client/src/routes/rooms/my.tsx
git commit -m "feat(ui): replace My Rooms sections with tab switcher"
```

- [ ] Task 1 complete

---

## Completed Tasks

### My Rooms + Join/Create Limits (2026-02-20) ✅

**Goal:** Add `/rooms/my` page showing user's active rooms in two sections ("Rooms I Created" / "Rooms I Joined"), enforce 3-room host limit and 5-room total membership limit (active rooms only: waiting/playing).

**Architecture:**
- Backend: New error classes → extend repository interfaces → implement in Drizzle repos → update use cases → new `GetMyRoomsUseCase` → new `GET /api/rooms/my` endpoint
- Frontend: API client function → new `/rooms/my` route (auth-guarded) → navbar link (auth-only) → limit error handling in create modal and join flow

---

#### Task 1: Add limit error classes
**Files:**
- Modify: `server/src/application/errors/business-rule.error.ts`
- Modify: `server/src/application/errors/index.ts`

**Step 1.1:** Add to `business-rule.error.ts`:
```typescript
export class RoomCreateLimitReachedError extends AppError {
  readonly statusCode = 422
  readonly code = 'ROOM_CREATE_LIMIT_REACHED'
  constructor() {
    super('You can only host 3 active rooms at a time')
  }
}

export class RoomJoinLimitReachedError extends AppError {
  readonly statusCode = 422
  readonly code = 'ROOM_JOIN_LIMIT_REACHED'
  constructor() {
    super('You can only be in 5 active rooms at a time')
  }
}
```

**Step 1.2:** Update export in `index.ts`:
```typescript
export {
  RoomNotWaitingError,
  RoomFullError,
  RoomCompletedError,
  NotRoomMemberError,
  RoomCreateLimitReachedError,
  RoomJoinLimitReachedError,
} from './business-rule.error'
```

**Step 1.3:** Commit:
```bash
git add server/src/application/errors/
git commit -m "feat(room): add RoomCreateLimitReached and RoomJoinLimitReached errors"
```

- [ ] Task 1 complete

---

#### Task 2: Extend IRoomRepository with `countActiveByHostId` + `findMyRooms`
**Files:**
- Modify: `server/src/domain/repositories/room.repository.ts`
- Modify: `server/src/infrastructure/repositories/drizzle-room.repository.ts`

**Step 2.1:** Add signatures to `room.repository.ts`:
```typescript
countActiveByHostId(hostId: string): Promise<number>
findMyRooms(userId: string): Promise<{ hosted: Room[]; joined: Room[] }>
```

**Step 2.2:** Implement `countActiveByHostId` in DrizzleRoomRepository:
```typescript
async countActiveByHostId(hostId: string): Promise<number> {
  const result = await this.db
    .select({ count: count() })
    .from(rooms)
    .where(
      and(
        eq(rooms.hostId, hostId),
        or(eq(rooms.status, 'waiting'), eq(rooms.status, 'playing')),
        isNull(rooms.completedAt)
      )
    )
  return result[0]?.count ?? 0
}
```
(Add `or`, `isNull` to drizzle-orm imports)

**Step 2.3:** Implement `findMyRooms` in DrizzleRoomRepository:
```typescript
async findMyRooms(userId: string): Promise<{ hosted: Room[]; joined: Room[] }> {
  const allMembersAlias = alias(roomMembers, 'all_members')
  const userMembershipAlias = alias(roomMembers, 'user_membership')

  const activeCondition = and(
    or(eq(rooms.status, 'waiting'), eq(rooms.status, 'playing')),
    isNull(rooms.completedAt)
  )

  const selectFields = {
    id: rooms.id, code: rooms.code, name: rooms.name,
    hostId: rooms.hostId, gameId: rooms.gameId, status: rooms.status,
    maxPlayers: rooms.maxPlayers, discordLink: rooms.discordLink,
    completedAt: rooms.completedAt, readyNotifiedAt: rooms.readyNotifiedAt,
    tags: rooms.tags, language: rooms.language,
    createdAt: rooms.createdAt, updatedAt: rooms.updatedAt,
    memberCount: count(allMembersAlias.id),
  }

  const hostedRows = await this.db
    .select(selectFields)
    .from(rooms)
    .leftJoin(allMembersAlias, eq(allMembersAlias.roomId, rooms.id))
    .where(and(eq(rooms.hostId, userId), activeCondition))
    .groupBy(rooms.id)
    .orderBy(desc(rooms.createdAt))

  const joinedRows = await this.db
    .select(selectFields)
    .from(rooms)
    .innerJoin(
      userMembershipAlias,
      and(eq(userMembershipAlias.roomId, rooms.id), eq(userMembershipAlias.userId, userId))
    )
    .leftJoin(allMembersAlias, eq(allMembersAlias.roomId, rooms.id))
    .where(and(ne(rooms.hostId, userId), activeCondition))
    .groupBy(rooms.id)
    .orderBy(desc(rooms.createdAt))

  const mapRow = (r: (typeof hostedRows)[0]) => ({
    ...mapRowToEntity({
      id: r.id, code: r.code, name: r.name, hostId: r.hostId, gameId: r.gameId,
      status: r.status, maxPlayers: r.maxPlayers, discordLink: r.discordLink,
      completedAt: r.completedAt, readyNotifiedAt: r.readyNotifiedAt,
      tags: r.tags, language: r.language, createdAt: r.createdAt, updatedAt: r.updatedAt,
    }),
    memberCount: r.memberCount,
    isMember: true as const,
  })

  return { hosted: hostedRows.map(mapRow), joined: joinedRows.map(mapRow) }
}
```
(Add `alias` from `drizzle-orm/pg-core`, `ne`, `desc` from `drizzle-orm`, import `roomMembers` schema)

**Step 2.4:** Commit:
```bash
git add server/src/domain/repositories/room.repository.ts server/src/infrastructure/repositories/drizzle-room.repository.ts
git commit -m "feat(room): add countActiveByHostId and findMyRooms to room repository"
```

- [ ] Task 2 complete

---

#### Task 3: Extend IRoomMemberRepository with `countActiveByUserId`
**Files:**
- Modify: `server/src/domain/repositories/room-member.repository.ts`
- Modify: `server/src/infrastructure/repositories/drizzle-room-member.repository.ts`

**Step 3.1:** Add signature to `room-member.repository.ts`:
```typescript
countActiveByUserId(userId: string): Promise<number>
```

**Step 3.2:** Implement in DrizzleRoomMemberRepository:
```typescript
async countActiveByUserId(userId: string): Promise<number> {
  const result = await this.db
    .select({ count: count() })
    .from(roomMembers)
    .innerJoin(rooms, eq(rooms.id, roomMembers.roomId))
    .where(
      and(
        eq(roomMembers.userId, userId),
        or(eq(rooms.status, 'waiting'), eq(rooms.status, 'playing')),
        isNull(rooms.completedAt)
      )
    )
  return result[0]?.count ?? 0
}
```
(Import `rooms` schema from `@infrastructure/database/schema/rooms`, add `or`, `isNull` from drizzle-orm)

**Step 3.3:** Commit:
```bash
git add server/src/domain/repositories/room-member.repository.ts server/src/infrastructure/repositories/drizzle-room-member.repository.ts
git commit -m "feat(room): add countActiveByUserId to room member repository"
```

- [ ] Task 3 complete

---

#### Task 4: Update CreateRoomUseCase — enforce 3-room host limit
**Files:**
- Modify: `server/src/application/use-cases/room/create-room.use-case.ts`
- Modify: `server/src/application/use-cases/room/create-room.use-case.spec.ts`

**Step 4.1:** In spec, add `countActiveByHostId: vi.fn().mockResolvedValue(0)` to the mock room repo in `beforeEach`, then add failing test:
```typescript
it('should throw RoomCreateLimitReachedError when user already hosts 3 active rooms', async () => {
  mockRoomRepo.countActiveByHostId.mockResolvedValue(3)
  await expect(useCase.execute({ ...validInput })).rejects.toThrow(RoomCreateLimitReachedError)
})
```

**Step 4.2:** Run `bun run test` from server → expect new test to FAIL

**Step 4.3:** In `create-room.use-case.ts`, after game validation and before room creation:
```typescript
const activeRoomCount = await this.roomRepository.countActiveByHostId(input.hostId)
if (activeRoomCount >= 3) {
  throw new RoomCreateLimitReachedError()
}
```
Import `RoomCreateLimitReachedError` from `@application/errors`.

**Step 4.4:** Run `bun run test` from server → all pass

**Step 4.5:** Commit:
```bash
git add server/src/application/use-cases/room/
git commit -m "feat(room): enforce 3-room host limit in CreateRoomUseCase"
```

- [ ] Task 4 complete

---

#### Task 5: Update JoinRoomUseCase — enforce 5-room total membership limit
**Files:**
- Modify: `server/src/application/use-cases/room/join-room.use-case.ts`
- Modify: `server/src/application/use-cases/room/join-room.use-case.spec.ts` (check if it exists, else find test file)

**Step 5.1:** In spec, add `countActiveByUserId: vi.fn().mockResolvedValue(0)` to the mock room member repo, then add failing test:
```typescript
it('should throw RoomJoinLimitReachedError when user is already in 5 active rooms', async () => {
  mockRoomMemberRepo.countActiveByUserId.mockResolvedValue(5)
  mockRoomMemberRepo.findByRoomAndUser.mockResolvedValue(null)
  await expect(useCase.execute({ roomId: 'room1', userId: 'user1' })).rejects.toThrow(RoomJoinLimitReachedError)
})
```

**Step 5.2:** Run tests → expect new test to FAIL

**Step 5.3:** In `join-room.use-case.ts`, after the idempotency check (existingMember early return) and before the room capacity check:
```typescript
const activeMembershipCount = await this.roomMemberRepository.countActiveByUserId(input.userId)
if (activeMembershipCount >= 5) {
  throw new RoomJoinLimitReachedError()
}
```
Import `RoomJoinLimitReachedError` from `@application/errors`.

**Step 5.4:** Run tests → all pass

**Step 5.5:** Commit:
```bash
git add server/src/application/use-cases/room/
git commit -m "feat(room): enforce 5-room membership limit in JoinRoomUseCase"
```

- [ ] Task 5 complete

---

#### Task 6: Create GetMyRoomsUseCase + spec
**Files:**
- Create: `server/src/application/use-cases/room/get-my-rooms.use-case.ts`
- Create: `server/src/application/use-cases/room/get-my-rooms.use-case.spec.ts`

**Step 6.1:** Write `get-my-rooms.use-case.spec.ts` (failing):
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetMyRoomsUseCase } from './get-my-rooms.use-case'
import type { IRoomRepository } from '@domain/repositories/room.repository'

describe('GetMyRoomsUseCase', () => {
  let mockRoomRepo: { findMyRooms: ReturnType<typeof vi.fn> }
  let useCase: GetMyRoomsUseCase

  beforeEach(() => {
    mockRoomRepo = { findMyRooms: vi.fn() }
    useCase = new GetMyRoomsUseCase(mockRoomRepo as unknown as IRoomRepository)
  })

  it('should return hosted and joined rooms for a user', async () => {
    const mockResult = { hosted: [{ id: '1' }], joined: [{ id: '2' }] }
    mockRoomRepo.findMyRooms.mockResolvedValue(mockResult)
    const result = await useCase.execute({ userId: 'user1' })
    expect(result).toEqual(mockResult)
    expect(mockRoomRepo.findMyRooms).toHaveBeenCalledWith('user1')
  })

  it('should return empty arrays when user has no rooms', async () => {
    mockRoomRepo.findMyRooms.mockResolvedValue({ hosted: [], joined: [] })
    const result = await useCase.execute({ userId: 'user1' })
    expect(result.hosted).toHaveLength(0)
    expect(result.joined).toHaveLength(0)
  })
})
```

**Step 6.2:** Run tests → expect FAIL

**Step 6.3:** Create `get-my-rooms.use-case.ts`:
```typescript
import type { Room } from '@domain/entities/room.entity'
import type { IRoomRepository } from '@domain/repositories/room.repository'

export interface GetMyRoomsOutput {
  readonly hosted: Room[]
  readonly joined: Room[]
}

export class GetMyRoomsUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: { userId: string }): Promise<GetMyRoomsOutput> {
    return this.roomRepository.findMyRooms(input.userId)
  }
}
```

**Step 6.4:** Run tests → all pass

**Step 6.5:** Commit:
```bash
git add server/src/application/use-cases/room/
git commit -m "feat(room): add GetMyRoomsUseCase"
```

- [ ] Task 6 complete

---

#### Task 7: Add GET /api/rooms/my to factory, controller, and routes
**Files:**
- Modify: `server/src/interface/factories/room.factory.ts` — read first to understand DI pattern, then inject GetMyRoomsUseCase
- Modify: `server/src/interface/controllers/room.controller.ts` — add `getMyRooms` handler
- Modify: `server/src/interface/routes/room.routes.ts` — register route (before `:code` to avoid routing conflicts)

**Step 7.1:** Read `room.factory.ts` to understand how use cases are injected into the controller, then add:
```typescript
const getMyRoomsUseCase = new GetMyRoomsUseCase(roomRepository)
// Pass to RoomController constructor
```

**Step 7.2:** Add `getMyRooms` to `RoomController`:
```typescript
async getMyRooms(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = request.session.user.id
  const result = await this.getMyRoomsUseCase.execute({ userId })
  reply.send({ hosted: result.hosted, joined: result.joined })
}
```

**Step 7.3:** Add route in `room.routes.ts` (before `GET /api/rooms/:code`):
```typescript
app.get('/api/rooms/my', {
  schema: {
    tags: ['Rooms'],
    summary: 'Get my rooms',
    description: 'Returns rooms created by or joined by the authenticated user.',
    security: [{ session: [] }],
    response: {
      200: z.object({ hosted: z.array(roomSchema), joined: z.array(roomSchema) }),
      401: errorResponse,
    },
  },
  preHandler: requireAuth,
  handler: roomController.getMyRooms.bind(roomController),
})
```

**Step 7.4:** Run `bun run typecheck` from server → 0 errors

**Step 7.5:** Commit:
```bash
git add server/src/interface/
git commit -m "feat(room): add GET /api/rooms/my endpoint"
```

- [ ] Task 7 complete

---

#### Task 8: Add API client function for my rooms (frontend)
**Files:**
- Read client API files (e.g., `client/src/lib/api.ts` or `client/src/hooks/`) to understand fetch pattern
- Modify the appropriate file to add `getMyRooms()`

**Step 8.1:** Find how other API calls are made (e.g., how rooms/index.tsx fetches `/api/rooms`), mirror that pattern:
```typescript
export async function getMyRooms(): Promise<{ hosted: Room[]; joined: Room[] }> {
  const res = await fetch('/api/rooms/my', { credentials: 'include' })
  if (!res.ok) {
    const err = await res.json()
    throw err
  }
  return res.json()
}
```

**Step 8.2:** Commit

- [ ] Task 8 complete

---

#### Task 9: Create /rooms/my frontend route
**Files:**
- Create: `client/src/routes/rooms/my.tsx`

**Step 9.1:** Read `client/src/routes/rooms/index.tsx` to copy the filter state, filter logic, game data fetching, and RoomCard rendering pattern.

**Step 9.2:** Create `my.tsx` as an auth-guarded page:
- Use `createFileRoute('/rooms/my')` (TanStack Router auto-discovers)
- Redirect to `/` if `session.user` is falsy using `useEffect` + `useNavigate`
- Same filter state: `search`, `filter`, `sort`, `language`, `tagFilter`
- Fetch games with `useQuery(['games'], getGames)` for RoomCard
- Fetch my rooms with `useQuery(['my-rooms'], getMyRooms, { enabled: !!session?.user })`
- Apply same client-side filter/sort function to both `hosted` and `joined` arrays
- Render two sections: "Rooms I Created" and "Rooms I Joined"
- Inline empty state per section: `<p className="text-white/40 text-sm py-4">No rooms here yet.</p>`
- Show "Create Room" button in header (same as rooms/index.tsx)
- Show `CreateRoomModal` when button is clicked
- Invalidate `['my-rooms']` query on successful room creation
- Join/leave actions: navigate to `/rooms/$code` on card click (re-use RoomCard's existing behavior)

**Step 9.3:** Run `bun run typecheck` from client → 0 errors

**Step 9.4:** Commit:
```bash
git add client/src/routes/rooms/my.tsx
git commit -m "feat(ui): add /rooms/my page with two-section layout"
```

- [ ] Task 9 complete

---

#### Task 10: Add "My Rooms" link to navbar
**Files:**
- Modify: `client/src/routes/__root.tsx`

**Step 10.1:** Read `__root.tsx` to understand the navbar structure and existing link styling.

**Step 10.2:** Add a "My Rooms" link visible only to authenticated users, next to existing nav links:
```tsx
{session?.user && (
  <Link
    to="/rooms/my"
    className="text-sm font-medium text-white/70 hover:text-white transition-colors"
    activeProps={{ className: 'text-accent' }}
  >
    My Rooms
  </Link>
)}
```
(Match the exact className pattern of existing navbar links)

**Step 10.3:** Run `bun run typecheck` → 0 errors

**Step 10.4:** Commit:
```bash
git add client/src/routes/__root.tsx
git commit -m "feat(ui): add My Rooms nav link for authenticated users"
```

- [ ] Task 10 complete

---

#### Task 11: Handle limit errors in create modal and join flow
**Files:**
- Read `client/src/components/rooms/create-room-modal.tsx` — verify it already shows API errors in AlertBox (no change needed if generic error handling works)
- Read `client/src/routes/rooms/index.tsx` — understand how join errors are handled, update if needed

**Step 11.1:** In `create-room-modal.tsx`, verify that the generic error handler catches 422 errors and shows `error.message` in AlertBox. If it does, no change needed (the server already sends human-readable messages).

**Step 11.2:** In `rooms/index.tsx`, find the join error handler and ensure `ROOM_JOIN_LIMIT_REACHED` shows the server's message:
```typescript
// In join mutation error handler, check if error message is already forwarded
// The server sends: { error: 'ROOM_JOIN_LIMIT_REACHED', message: 'You can only be in 5 active rooms at a time' }
// Ensure setJoinError or toast uses error.message
```

**Step 11.3:** Commit if any changes made

- [ ] Task 11 complete

---

#### Task 12: Verification ✅
- [x] Run `bun run test` from root → 39/39 tests pass
- [x] Run `bun run typecheck` from root → 0 errors across all packages
- [x] Run `bun run lint` from root → 0 errors, 0 warnings

---

## Completed Tasks

### Tags + Language Feature (2026-02-20) ✅

**Design:** Add custom tags (up to 5, max 15 chars each) and language selection (PT-BR / EN) to rooms. Tags and language are persisted in the database (Drizzle `text[].array()` + `varchar`), displayed on room cards, and filterable in the lobby.

#### Database & Server
- [x] Update Drizzle schema `rooms` — add `tags text[].array()` and `language varchar(5)` with defaults
- [x] Generate and run migration (`db:generate` + `db:migrate`)
- [x] Update domain entity `Room` — add `tags: string[]` and `language: 'en' | 'pt-br'`
- [x] Update `CreateRoomInput` and `UpdateRoomInput` in domain entity
- [x] Update shared schema `packages/schemas` — add tags + language to `createRoomInputSchema` and `roomSchema`
- [x] Update `packages/types` — add tags + language to `Room` type
- [x] Update `DrizzleRoomRepository` — insert and select tags + language
- [x] Update `CreateRoomUseCase` — pass tags + language through to repository
- [x] Update affected unit tests

#### Frontend
- [x] Update `CreateRoomModal` — add tag chip input (Enter/comma adds chip, max 5) and PT-BR/EN language toggle
- [x] Update `rooms/index.tsx` — include `tags` and `language` in `createRoomMutation` payload
- [x] Update `RoomCard` — replace hardcoded `🇧🇷 PT` badge and `deriveTag()` with real `room.language` and `room.tags` data
- [x] Update `RoomFilters` — add language filter (All / PT-BR / EN) and tag text filter
- [x] Update filter logic in `rooms/index.tsx` — filter by language and by tag

#### Verification
- [x] Typecheck pass (all 4 packages)
- [x] Lint pass (0 errors, 0 warnings)
- [x] Tests passing (33/33)

---

### Room Card Redesign v2 — Background Image + Info-First Layout (2026-02-19)

**Design:** Image moves to right side as background with gradient fade, content stays left with clear hierarchy: room name > game name > tags + code > player dots. Image desaturated by default, gains color on hover. Member indicator via subtle accent border.

- [x] Refactor `room-card.tsx` — image as absolute background right, gradient overlay, desaturated default
- [x] Update content layout — room name prominent, game name in accent, tags + code row, dots at bottom
- [x] Add hover effect — image saturate + brightness transition, CTA overlay with backdrop-blur
- [x] Add `isMember` indicator — subtle `border-accent/30` on member cards
- [x] Increase card height to `h-48`
- [x] Update loading skeleton in `rooms/index.tsx` to match new h-48
- [x] Typecheck + lint pass (0 errors, 0 warnings)

### Room Card Banner Design Refactor (2026-02-17) ✅

**Design:** Horizontal neon banner, 2-column grid, image left + content right, neon left border, visual mock tags (language PT + contextual tag derived from room name), player slots as dot indicators.

- [x] Redesign `client/src/components/rooms/room-card.tsx` → horizontal banner layout
- [x] Update grid in `client/src/routes/rooms/index.tsx` → `grid-cols-1 lg:grid-cols-2`
- [x] Update loading skeleton in `rooms/index.tsx` → landscape dimensions
- [x] Typecheck + lint pass (0 errors, 0 warnings)

## Completed Tasks

### WS Fix, Notification Redesign & Room Visibility (2026-02-17)

- [x] **Fix WS real-time updates**: Added `room_updated` event type (schema, types, handler) so lobby subscribers see member count changes in real-time when players join/leave rooms
- [x] **Broadcast from HTTP controllers**: `RoomController.join()` now broadcasts `room_updated` (or `room_deleted` when full) to lobby; `leave()` broadcasts `room_updated` for non-host leaves
- [x] **Client lobby handling**: `use-rooms-cache` now has `updateRoom()`, `use-lobby-events` subscribes to `room_updated` to patch member counts in cache
- [x] **Notification backend**: Added `DELETE /api/notifications/:id`, `POST /api/notifications/read-all` endpoints with repository methods
- [x] **Notification menu redesign**: Game icon + badge, room name as title, player count, relative timestamps, dismiss (X) button, "Mark all read" action, better empty state
- [x] **Room deletion flow**: Full rooms now hidden from listing immediately (`completedAt IS NOT NULL` filter in `findAvailable()`), still accessible via direct URL, deletion changed from 5min to 1 hour
- [x] All 29 tests passing, typecheck pass (4 packages), lint pass (0 errors, 0 warnings)

### Migrate SVG Icons to Lucide React (2026-02-16)

- [x] Install `lucide-react` and create `DiscordIcon` custom component (`client/src/components/ui/icons.tsx`)
- [x] Migrate 28 inline SVGs across 14 files to Lucide React components
- [x] Files migrated: `__root.tsx`, `rooms/index.tsx`, `rooms/$code.tsx`, `hero-section.tsx`, `cta-banner.tsx`, `how-it-works.tsx`, `faq-section.tsx`, `create-room-modal.tsx`, `room-filters.tsx`, `empty-state.tsx`, `player-slot.tsx`, `discord-link-card.tsx`, `alert-box.tsx`, `pagination.tsx`
- [x] Kept animated `motion.svg` elements untouched (cursor, user slots in how-it-works)
- [x] Typecheck pass, lint pass (0 errors, 0 warnings)

### Rooms Listing Pagination (2026-02-16)

- [x] Create `use-pagination` hook (`client/src/hooks/use-pagination.ts`) — reusable, handles page clamping, page range with ellipsis
- [x] Create `Pagination` UI component (`client/src/components/ui/pagination.tsx`) — accessible, dark themed, hidden when single page
- [x] Integrate pagination into rooms listing (`client/src/routes/rooms/index.tsx`) — 6 cards/page, resets on filter change, scroll-to-top on page change
- [x] Typecheck pass (all 4 packages)

### CreateRoomModal Form Validation & UX Improvements (2026-02-13)

- [x] Install `react-hook-form` and `@hookform/resolvers` in client
- [x] Add `.input-field-error` and `.field-error` CSS utility classes to `globals.css`
- [x] Rewrite `CreateRoomModal` with react-hook-form + zodResolver (reuses shared `createRoomInputSchema`)
- [x] Replace native `<select>` with Base UI `Select` component (scrollable portal dropdown, dark themed)
- [x] Add inline per-field error messages with red border styling
- [x] Display API errors inside the modal via AlertBox (modal stays open on errors)
- [x] Update parent `rooms/index.tsx` to use `mutateAsync` (errors handled in modal, not page)
- [x] All 29 tests passing, typecheck pass, lint pass (0 errors, 0 warnings)

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
- [x] Create `turbo.json` with task config (build, dev, typecheck, test, lint, db:\*)
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
