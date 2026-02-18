# Room Card Banner Design Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign room cards from a vertical 3-column grid into a horizontal 2-column neon banner layout with visual language/contextual tags.

**Architecture:** Pure frontend-only refactor. Two files change: `room-card.tsx` (complete redesign to flex-row banner) and `rooms/index.tsx` (grid class + skeleton update). No backend changes, no type changes, no new dependencies.

**Tech Stack:** React, Tailwind CSS, motion/react-client (already installed), Lucide React (already installed).

---

## Context & Design Spec

### Card Anatomy

```
┌ neon ──────────────────────────────────────────────┐
┃┃              │  CS2  🇧🇷 PT  🏷 ranked   10m ago  │
┃┃   [IMAGE]   │  Ranked Grind Tonight               │
┃┃   38% wide  │  A3F9X2                             │
┃┃   full-h    │  ⬤ ⬤ ⬤ ○ ○   3 / 5 players         │
┃┃              │                          [JOIN →]  │
└────────────────────────────────────────────────────┘
```

### Visual Rules

- **Card height:** `h-40` (160px fixed)
- **Grid:** `grid-cols-1 lg:grid-cols-2` (was: `sm:grid-cols-2 lg:grid-cols-3`)
- **Neon left border:** `border-l-2 border-accent`, hover → `shadow-[inset_2px_0_8px_rgba(0,255,162,0.3)]`
- **Image section:** `w-2/5` shrink-0, `overflow-hidden relative`; right edge fades with `bg-gradient-to-r from-transparent to-surface` overlay; hover → image `scale-110`
- **Tag row:** game badge (`badge-accent` xs) + language badge (`badge-muted` xs, hardcoded 🇧🇷 PT with `// TODO: language from room data`) + contextual tag (derived from room name, see logic below) + time-ago (`ml-auto text-[10px] text-muted`)
- **Room name:** `font-heading font-bold text-sm leading-tight` truncate
- **Room code:** `font-mono text-[10px] text-muted/60 mt-0.5`
- **Player dots:** `flex gap-1 flex-wrap`. Each slot: `size-2 rounded-full`. Filled = `bg-accent`, Empty = `bg-border ring-1 ring-border-light`. Max 8 rendered; if `maxPlayers > 8` show `... +{remaining}` text in `text-[10px] text-muted`
- **Player count text:** `text-xs text-muted ml-1` — "{members}/{maxPlayers} players"
- **JOIN button:** `px-3 py-1 rounded-md text-[11px] font-semibold transition-all` — same 3 states as current (isMember / isFull / default)

### Contextual Tag Logic

```ts
function deriveTag(roomName: string): string | null {
  const lower = roomName.toLowerCase()
  if (/rank|ranked|comp|competitive|elo|mmr/.test(lower)) return 'ranked'
  if (/casual|fun|relaxed|chill/.test(lower)) return 'casual'
  if (/tryhard|serious|pro|tournament/.test(lower)) return 'tryhard'
  return null
}
```

---

## Task 1: Redesign `room-card.tsx`

**Files:**
- Modify: `client/src/components/rooms/room-card.tsx`

No tests for this (pure visual component). Verify visually after.

**Step 1: Replace the entire file content**

```tsx
import * as motion from 'motion/react-client'
import { useTimeAgo } from '@/hooks/use-time-ago'
import type { Room, Game } from '@/types'

interface RoomCardProps {
  room: Room
  game: Game | undefined
  onJoin: (roomCode: string) => void
  isLoading?: boolean
  currentMembers?: number
}

function deriveTag(roomName: string): string | null {
  const lower = roomName.toLowerCase()
  if (/rank|ranked|comp|competitive|elo|mmr/.test(lower)) return 'ranked'
  if (/casual|fun|relaxed|chill/.test(lower)) return 'casual'
  if (/tryhard|serious|pro|tournament/.test(lower)) return 'tryhard'
  return null
}

export function RoomCard({ room, game, onJoin, isLoading, currentMembers }: RoomCardProps) {
  const timeAgo = useTimeAgo(room.createdAt)
  const members = currentMembers ?? 1
  const isFull = members >= room.maxPlayers
  const contextualTag = deriveTag(room.name)

  const MAX_DOTS = 8
  const visibleSlots = Math.min(room.maxPlayers, MAX_DOTS)
  const extraSlots = room.maxPlayers > MAX_DOTS ? room.maxPlayers - MAX_DOTS : 0

  return (
    <motion.div
      className="card-hover group flex flex-row h-40 overflow-hidden border-l-2 border-l-accent/60 hover:border-l-accent hover:shadow-[inset_2px_0_8px_rgba(0,255,162,0.2)]"
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
    >
      {/* Left: Game image */}
      <div className="relative w-2/5 shrink-0 overflow-hidden">
        {game?.coverUrl ? (
          <img
            src={game.coverUrl}
            alt={game.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-surface-light" />
        )}
        {/* Right-edge fade into card background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-surface/90" />
      </div>

      {/* Right: Content */}
      <div className="flex-1 min-w-0 flex flex-col px-4 py-3">
        {/* Top row: tags + time */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {game && (
            <span className="badge-accent text-[10px] px-1.5 py-0.5">{game.name}</span>
          )}
          {/* TODO: language from room data */}
          <span className="badge-muted text-[10px] px-1.5 py-0.5">🇧🇷 PT</span>
          {contextualTag && (
            <span className="badge-muted text-[10px] px-1.5 py-0.5">🏷 {contextualTag}</span>
          )}
          <span className="ml-auto text-[10px] text-muted shrink-0">{timeAgo}</span>
        </div>

        {/* Room name + code */}
        <h3 className="font-heading text-sm font-bold leading-tight truncate">{room.name}</h3>
        <p className="font-mono text-[10px] text-muted/60 mt-0.5 mb-auto">{room.code}</p>

        {/* Bottom row: player dots + count + button */}
        <div className="flex items-center gap-2 mt-2">
          {/* Player slots */}
          <div className="flex items-center gap-1 flex-wrap">
            {Array.from({ length: visibleSlots }).map((_, i) => (
              <span
                key={i}
                className={`size-2 rounded-full shrink-0 ${
                  i < members ? 'bg-accent' : 'bg-border ring-1 ring-border-light'
                }`}
              />
            ))}
            {extraSlots > 0 && (
              <span className="text-[10px] text-muted">+{extraSlots}</span>
            )}
          </div>
          <span className="text-[11px] text-muted whitespace-nowrap">
            <span className="text-offwhite font-medium">{members}</span>/{room.maxPlayers}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action button */}
          <button
            onClick={() => onJoin(room.code)}
            disabled={isLoading || (isFull && !room.isMember)}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 ${
              room.isMember
                ? 'bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20'
                : isFull
                  ? 'bg-surface-light text-muted cursor-not-allowed'
                  : 'bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 disabled:opacity-40'
            }`}
          >
            {room.isMember
              ? 'SEE ROOM'
              : isFull
                ? 'FULL'
                : isLoading
                  ? '...'
                  : 'JOIN →'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
```

**Step 2: Verify the file is saved correctly**

Open `client/src/components/rooms/room-card.tsx` and confirm the new content is there.

---

## Task 2: Update grid and skeleton in `rooms/index.tsx`

**Files:**
- Modify: `client/src/routes/rooms/index.tsx`

**Step 1: Update the loading skeleton**

Find the loading skeleton block (around line 178-187):
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className="card h-52 animate-pulse" />
  ))}
</div>
```

Replace with:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  {Array.from({ length: 4 }).map((_, i) => (
    <div key={i} className="card h-40 animate-pulse" />
  ))}
</div>
```

**Step 2: Update the room cards grid**

Find the rooms grid div (around line 252):
```tsx
<div id="rooms-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

Replace with:
```tsx
<div id="rooms-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
```

---

## Task 3: Verify — Typecheck + Lint

**Step 1: Run typecheck**

```bash
bun run typecheck
```

Expected: 0 errors across all packages.

**Step 2: Run lint**

```bash
bun run lint
```

Expected: 0 errors, 0 warnings.

**Step 3: Visual check**

Start dev server (`bun run dev`) and navigate to `/rooms`. Confirm:
- Cards are horizontal banners (~160px tall)
- 2-column grid on large screens, 1-column on mobile
- Game image on the left, fades into content
- Neon left border visible, glows on hover
- Tags row: game name + 🇧🇷 PT + contextual tag (if derived) + time-ago
- Player dots correctly filled/empty
- JOIN button compact and functional

---

## Task 4: Commit

```bash
git add client/src/components/rooms/room-card.tsx client/src/routes/rooms/index.tsx
git commit -m "feat(ui): redesign room cards as horizontal neon banners"
```
