import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSession } from '@/lib/auth-client'
import { api } from '@/lib/api'
import { getUserFriendlyError } from '@/lib/error-messages'
import { useWebSocket } from '@/hooks/use-websocket'
import { useRoomsCache } from '@/hooks/use-rooms-cache'
import { useTimeAgo } from '@/hooks/use-time-ago'
import { PlayerSlot } from '@/components/rooms/player-slot'
import { DiscordLinkCard } from '@/components/rooms/discord-link-card'
import { AlertBox } from '@/components/ui/alert-box'
import { parseWsPayload } from '@/lib/ws-validators'
import {
  roomJoinedPayloadSchema,
  playerJoinedPayloadSchema,
  playerLeftPayloadSchema,
  errorPayloadSchema,
  roomDeletedPayloadSchema,
} from '@squadfinder/schemas/ws'
import { ArrowLeft, Copy, LogOut } from 'lucide-react'
import type { RoomResponse, GamesResponse, Player } from '@/types'

export const Route = createFileRoute('/rooms/$code')({
  component: RoomLobbyPage,
})

function RoomLobbyPage() {
  const { code } = Route.useParams()
  const { data: session, isPending: sessionPending } = useSession()
  const navigate = useNavigate()
  const { removeRoom } = useRoomsCache()
  const queryClient = useQueryClient()

  const [players, setPlayers] = useState<Player[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isRoomReady, setIsRoomReady] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  // Fetch room data
  const {
    data: roomData,
    isLoading: roomLoading,
    error: roomError,
  } = useQuery({
    queryKey: ['room', code],
    queryFn: () => api.get<RoomResponse>(`/api/rooms/${code}`),
  })

  const room = roomData?.room ?? null

  const timeAgo = useTimeAgo(room?.createdAt)

  // Fetch games for cover image
  const { data: gamesData } = useQuery({
    queryKey: ['games'],
    queryFn: () => api.get<GamesResponse>('/api/games'),
    staleTime: 60_000,
  })

  const game = gamesData?.games?.find((g) => g.id === room?.gameId)

  // WebSocket connection
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
  const { isConnected, send, on } = useWebSocket({
    url: wsUrl,
    autoConnect: true,
  })

  // WebSocket event handlers
  useEffect(() => {
    const unsubscribeJoined = on('room_joined', (raw) => {
      const data = parseWsPayload(roomJoinedPayloadSchema, raw)
      if (!data) return
      setPlayers(data.players)
    })

    const unsubscribePlayerJoined = on('player_joined', (raw) => {
      const data = parseWsPayload(playerJoinedPayloadSchema, raw)
      if (!data) return
      setPlayers((prev) => {
        if (prev.some((p) => p.id === data.player.id)) return prev
        return [...prev, data.player]
      })
    })

    const unsubscribePlayerLeft = on('player_left', (raw) => {
      const data = parseWsPayload(playerLeftPayloadSchema, raw)
      if (!data) return
      setPlayers((prev) => prev.filter((p) => p.id !== data.playerId))
    })

    const unsubscribeRoomReady = on('room_ready', () => {
      setIsRoomReady(true)
    })

    const unsubscribeError = on('error', (raw) => {
      const data = parseWsPayload(errorPayloadSchema, raw)
      if (!data) return
      setError(data.message)
    })

    const unsubscribeRoomDeleted = on('room_deleted', (raw) => {
      const data = parseWsPayload(roomDeletedPayloadSchema, raw)
      if (!data) return
      removeRoom(data.roomId)
      navigate({ to: '/rooms' })
    })

    return () => {
      unsubscribeJoined()
      unsubscribePlayerJoined()
      unsubscribePlayerLeft()
      unsubscribeRoomReady()
      unsubscribeError()
      unsubscribeRoomDeleted()
    }
  }, [on, removeRoom, navigate])

  // Join room via WebSocket when connected
  useEffect(() => {
    if (isConnected && room) {
      send('join_room', { roomCode: code })
    }
  }, [isConnected, room, code, send])

  const handleLeaveRoom = async () => {
    try {
      const isHost = room?.hostId === session?.user?.id
      send('leave_room', { roomCode: code })
      await api.post(`/api/rooms/${code}/leave`, {})
      if (isHost && room) {
        removeRoom(room.id)
      }
      await queryClient.invalidateQueries({ queryKey: ['rooms'] })
      navigate({ to: '/rooms' })
    } catch (err) {
      toast.error(getUserFriendlyError(err))
    }
  }

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  // Build empty slots
  const maxPlayers = room?.maxPlayers ?? 5
  const emptySlots = Math.max(0, maxPlayers - players.length)

  if (sessionPending || roomLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="card h-48 animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-16 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <p className="text-muted">Please sign in to view this room.</p>
      </div>
    )
  }

  if (roomError || (error && !room)) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <p className="text-danger mb-4">{roomError instanceof Error ? roomError.message : error}</p>
        <Link to="/rooms" className="btn-ghost">
          Back to rooms
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/rooms"
          className="flex items-center gap-2 rounded-lg border border-border-light bg-surface px-4 py-2 text-sm text-muted hover:text-offwhite hover:border-muted/30 hover:bg-surface-hover transition-all"
        >
          <ArrowLeft className="size-4" />
          Back to rooms
        </Link>
        <button
          onClick={handleLeaveRoom}
          disabled={isRoomReady}
          className="flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 px-4 py-2 text-sm text-danger/80 hover:text-danger hover:bg-danger/10 hover:border-danger/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title={isRoomReady ? 'Cannot leave a full room' : undefined}
        >
          <LogOut className="size-4" />
          {isRoomReady ? 'Squad locked' : 'Leave room'}
        </button>
      </div>

      {/* Room Header with game cover background */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        {/* Background image */}
        <div className="absolute inset-0">
          {game?.coverUrl ? (
            <img
              src={game.coverUrl}
              alt=""
              className="w-full h-full object-cover scale-110 blur-sm"
            />
          ) : (
            <div className="w-full h-full bg-surface-light" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/70" />
        </div>

        {/* Header content */}
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {game && <span className="badge-accent text-[10px]">{game.name}</span>}
                {room?.language && (
                  <span className="badge-muted text-[10px]">
                    {room.language === 'pt-br' ? 'PT-BR' : 'EN'}
                  </span>
                )}
                <span className="badge-muted text-[10px]">{timeAgo}</span>
                <span
                  className={`size-2 rounded-full ${isConnected ? 'bg-accent' : 'bg-danger'}`}
                />
              </div>
              {room?.tags && room.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {room.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md border border-accent/20 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="font-heading text-2xl font-bold sm:text-3xl">{room?.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-sm text-muted hover:text-offwhite transition-colors"
                >
                  <span className="font-mono font-bold text-offwhite">{code}</span>
                  <Copy className="size-3.5" />
                  {codeCopied && <span className="text-xs text-accent">Copied!</span>}
                </button>
                <span className="text-sm text-muted">
                  {players.length}/{maxPlayers} players
                </span>
              </div>
            </div>

            {/* Game cover thumbnail */}
            {game?.coverUrl && (
              <img
                src={game.coverUrl}
                alt={game.name}
                className="hidden sm:block w-20 h-28 rounded-lg object-cover border border-border shadow-lg"
              />
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <AlertBox type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {/* Discord invite — full-width, prominent */}
      {isRoomReady && room?.discordLink && (
        <div className="mb-6">
          <DiscordLinkCard discordLink={room.discordLink} isRoomReady={isRoomReady} />
        </div>
      )}

      {/* Players — full width */}
      <div className="card p-5">
        <h2 className="font-heading text-sm font-bold text-muted mb-4 uppercase tracking-wider">
          Players ({players.length}/{maxPlayers})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {players.map((player, i) => (
            <PlayerSlot key={player.id} player={player} index={i} />
          ))}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <PlayerSlot key={`empty-${i}`} index={players.length + i} />
          ))}
        </div>
      </div>
    </div>
  )
}
