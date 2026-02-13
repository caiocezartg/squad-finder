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

export function RoomCard({ room, game, onJoin, isLoading, currentMembers }: RoomCardProps) {
  const timeAgo = useTimeAgo(room.createdAt)
  const members = currentMembers ?? 1
  const fillPercent = Math.round((members / room.maxPlayers) * 100)
  const isFull = members >= room.maxPlayers

  return (
    <motion.div
      className="card-hover group flex flex-col"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      {/* Game cover strip */}
      <div className="relative h-48 overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />

        {/* Game badge */}
        {game && (
          <span className="absolute bottom-2 left-3 badge-accent text-[10px]">{game.name}</span>
        )}

        {/* Time badge */}
        <span className="absolute top-2 right-2 badge-muted text-[10px]">{timeAgo}</span>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h3 className="font-heading text-sm font-bold truncate">{room.name}</h3>
            <p className="text-xs text-muted mt-0.5 font-mono">{room.code}</p>
          </div>
        </div>

        {/* Player progress */}
        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted">
              <span className="text-offwhite font-medium">{members}</span>/{room.maxPlayers} players
            </span>
            <span className={isFull ? 'text-accent font-medium' : 'text-muted'}>
              {isFull ? 'Full' : `${fillPercent}%`}
            </span>
          </div>
          <div className="h-1 rounded-full bg-border overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull ? 'bg-accent' : 'bg-accent/60'
              }`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => onJoin(room.code)}
          disabled={isLoading || (isFull && !room.isMember)}
          className={`mt-4 w-full py-2 rounded-lg text-xs font-semibold transition-all ${
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
              ? 'ROOM FULL'
              : isLoading
                ? 'JOINING...'
                : 'JOIN ROOM'}
        </button>
      </div>
    </motion.div>
  )
}
