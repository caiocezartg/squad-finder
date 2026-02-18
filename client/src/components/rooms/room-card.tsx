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
  const isDisabled = isLoading || (isFull && !room.isMember)

  const MAX_DOTS = 8
  const visibleSlots = Math.min(room.maxPlayers, MAX_DOTS)
  const extraSlots = room.maxPlayers > MAX_DOTS ? room.maxPlayers - MAX_DOTS : 0

  return (
    <motion.button
      type="button"
      onClick={() => onJoin(room.code)}
      disabled={isDisabled}
      className={`card group flex flex-row h-40 w-full text-left overflow-hidden transition-all duration-300 ${
        isDisabled
          ? 'grayscale opacity-50 cursor-not-allowed border-border'
          : 'cursor-pointer hover:border-accent/25 hover:shadow-[0_6px_32px_rgba(0,255,162,0.07)] hover:-translate-y-0.5'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Left: Game image (narrow) */}
      <div className="relative w-[28%] shrink-0 overflow-hidden">
        {game?.coverUrl ? (
          <img
            src={game.coverUrl}
            alt={game.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-disabled:group-hover:scale-100"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-surface-light" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-surface/20 to-surface" />

        {/* Full room overlay */}
        {isFull && !room.isMember && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-[10px] font-bold tracking-[0.2em] text-muted/80 uppercase">
              Full
            </span>
          </div>
        )}
      </div>

      {/* Right: Content */}
      <div className="relative flex-1 min-w-0 flex flex-col px-4 py-3">
        {/* Top: code + time */}
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] text-muted/40">{room.code}</span>
          <span className="text-[10px] text-muted/60">{timeAgo}</span>
        </div>

        {/* Room name — hero element */}
        <h3 className="font-heading text-base font-bold leading-snug truncate">{room.name}</h3>

        {/* Tags (below name) */}
        <div className="flex items-center gap-1.5 flex-wrap mt-1.5 mb-auto">
          {game && <span className="badge-accent text-[10px] px-1.5 py-0.5">{game.name}</span>}
          {/* TODO: language from room data */}
          <span className="badge-muted text-[10px] px-1.5 py-0.5">🇧🇷 PT</span>
          {contextualTag && (
            <span className="badge-muted text-[10px] px-1.5 py-0.5">{contextualTag}</span>
          )}
        </div>

        {/* Bottom: player dots + count */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: visibleSlots }).map((_, i) => (
              <span
                key={i}
                className={`size-3 rounded-full shrink-0 transition-colors ${
                  i < members
                    ? 'bg-accent shadow-[0_0_6px_rgba(0,255,162,0.3)]'
                    : 'bg-surface-light ring-1 ring-border-light'
                }`}
              />
            ))}
            {extraSlots > 0 && <span className="text-[10px] text-muted ml-0.5">+{extraSlots}</span>}
          </div>
          <span className="text-xs text-muted">
            <span className="text-offwhite font-medium">{members}</span>/{room.maxPlayers}
          </span>
        </div>

        {/* Hover overlay with CTA */}
        {!isDisabled && (
          <div className="absolute inset-0 flex items-center justify-end pr-6 bg-gradient-to-r from-transparent via-surface/70 to-surface/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="font-heading text-sm font-bold tracking-wide text-accent drop-shadow-[0_0_12px_rgba(0,255,162,0.4)]">
              {room.isMember ? 'SEE ROOM' : 'JOIN ROOM'}
            </span>
          </div>
        )}
      </div>
    </motion.button>
  )
}
