import * as motion from 'motion/react-client'
import { useTimeAgo } from '@/hooks/use-time-ago'
import { Check, Users } from 'lucide-react'
import type { Room, Game } from '@/types'

interface RoomCardProps {
  room: Room
  game: Game | undefined
  onJoin: (roomCode: string) => void
  isLoading?: boolean
  currentMembers?: number
}

/** Y-axis focus for each game cover (IGDB covers are portrait). */
const COVER_POSITION_Y: Record<string, string> = {
  roblox: '50%',
  minecraft: '25%',
  cs2: '30%',
  fortnite: '10%',
  dota2: '20%',
  lol: '25%',
  pubg: '20%',
  freefire: '20%',
  valorant: '15%',
  warzone: '60%',
  apex: '10%',
  gtaonline: '45%',
  rocketleague: '35%',
  r6siege: '5%',
  amongus: '30%',
  overwatch2: '15%',
  wow: '5%',
  fc25: '5%',
  dbd: '10%',
}

export function RoomCard({ room, game, onJoin, isLoading, currentMembers }: RoomCardProps) {
  const timeAgo = useTimeAgo(room.createdAt)
  const members = currentMembers ?? 1
  const isFull = members >= room.maxPlayers
  const isDisabled = isLoading || (isFull && !room.isMember)

  const MAX_DOTS = 8
  const visibleSlots = Math.min(room.maxPlayers, MAX_DOTS)
  const extraSlots = room.maxPlayers > MAX_DOTS ? room.maxPlayers - MAX_DOTS : 0

  return (
    <motion.button
      type="button"
      onClick={() => onJoin(room.code)}
      disabled={isDisabled}
      className={`group relative w-full text-left rounded-xl border bg-surface overflow-hidden transition-all duration-300 ${
        isDisabled
          ? 'grayscale opacity-50 cursor-not-allowed border-border'
          : 'cursor-pointer border-border hover:border-accent/25 hover:shadow-[0_6px_32px_rgba(0,255,162,0.07)] hover:-translate-y-0.5'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Image banner — top section */}
      <div className="relative h-40 overflow-hidden bg-surface-light">
        {game?.coverUrl ? (
          <img
            src={game.coverUrl}
            alt={game.name}
            className="w-full h-full object-cover"
            style={{
              objectPosition: `center ${game.slug ? (COVER_POSITION_Y[game.slug] ?? '20%') : '20%'}`,
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-surface-light" />
        )}

        {/* Subtle bottom vignette so image doesn't end too abruptly */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-surface/40 to-transparent" />

        {/* Game name pill — bottom-left of image */}
        {game && (
          <span className="absolute bottom-2 left-3 text-[11px] font-semibold text-white bg-black/60 backdrop-blur-sm rounded-md px-2 py-0.5">
            {game.name}
          </span>
        )}

        {/* Joined indicator — top-right of image */}
        {room.isMember && (
          <span className="absolute top-2 right-3 flex items-center gap-1 text-[10px] font-semibold text-accent bg-surface/80 backdrop-blur-sm rounded-md px-2 py-0.5 border border-accent/20">
            <Check className="size-3" />
            Joined
          </span>
        )}

        {/* Hover CTA overlay on image */}
        {!isDisabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="font-heading text-xl font-bold tracking-widest uppercase text-accent drop-shadow-[0_0_24px_rgba(0,255,162,0.7)]">
              {room.isMember ? 'SEE ROOM' : 'JOIN ROOM'}
            </span>
          </div>
        )}

        {/* Full room overlay */}
        {isFull && !room.isMember && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-[10px] font-bold tracking-[0.2em] text-muted/80 uppercase">
              Full
            </span>
          </div>
        )}
      </div>

      {/* Content — bottom section */}
      <div className="flex flex-col gap-2.5 px-4 py-3">
        {/* Row 1: Room name + meta */}
        <div>
          <h3 className="font-heading text-base font-bold leading-snug truncate">{room.name}</h3>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="badge-muted text-[10px] px-1.5 py-0.5">
              {room.language === 'pt-br' ? '🇧🇷 PT-BR' : '🇺🇸 EN'}
            </span>
            {room.tags.map((tag) => (
              <span key={tag} className="badge-muted text-[10px] px-1.5 py-0.5">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Row 2: Code + time */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-light">#{room.code}</span>
          <span className="text-[10px] text-muted/40">·</span>
          <span className="text-[11px] text-muted/50">{timeAgo}</span>
        </div>

        {/* Row 3: Player dots + count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: visibleSlots }).map((_, i) => (
              <span
                key={i}
                className={`size-2.5 rounded-full shrink-0 transition-colors ${
                  i < members
                    ? 'bg-accent shadow-[0_0_6px_rgba(0,255,162,0.3)]'
                    : 'bg-surface-light ring-1 ring-border-light'
                }`}
              />
            ))}
            {extraSlots > 0 && <span className="text-[10px] text-muted ml-0.5">+{extraSlots}</span>}
          </div>
          <span className="flex items-center gap-1 text-xs text-muted">
            <Users className="size-3" />
            <span className="text-offwhite font-medium">{members}</span>/{room.maxPlayers}
          </span>
        </div>
      </div>
    </motion.button>
  )
}
