import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useSession } from '@/lib/auth-client'
import { api } from '@/lib/api'
import { useWebSocket } from '@/hooks/use-websocket'
import { useMessageLog } from '@/hooks/use-message-log'
import { useRoomsCache } from '@/hooks/use-rooms-cache'
import { RoomHeader } from '@/components/rooms/room-header'
import { PlayersList } from '@/components/rooms/players-list'
import { WebSocketLog } from '@/components/rooms/web-socket-log'
import { AlertBox } from '@/components/ui/alert-box'
import type {
  Room,
  RoomResponse,
  Player,
  RoomJoinedPayload,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  RoomReadyPayload,
  RoomDeletedPayload,
  WsErrorPayload,
} from '@/types'

export const Route = createFileRoute('/rooms/$code')({
  component: RoomLobbyPage,
})

function RoomLobbyPage() {
  const { code } = Route.useParams()
  const { data: session, isPending: sessionPending } = useSession()
  const navigate = useNavigate()
  const { removeRoom } = useRoomsCache()
  const { messages, addMessage } = useMessageLog()

  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRoomReady, setIsRoomReady] = useState(false)

  // WebSocket connection
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
  const { isConnected, send, on } = useWebSocket({
    url: wsUrl,
    autoConnect: true,
  })

  // Fetch room data
  useEffect(() => {
    async function fetchRoom() {
      try {
        const data = await api.get<RoomResponse>(`/api/rooms/${code}`)
        setRoom(data.room)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load room')
      } finally {
        setLoading(false)
      }
    }
    fetchRoom()
  }, [code])

  // WebSocket event handlers
  useEffect(() => {
    const unsubscribeJoined = on('room_joined', (raw) => {
      const data = raw as RoomJoinedPayload
      addMessage(`Joined room! ${data.players.length} players in room`)
      setPlayers(data.players)
    })

    const unsubscribePlayerJoined = on('player_joined', (raw) => {
      const data = raw as PlayerJoinedPayload
      addMessage(`Player joined: ${data.player.name}`)
      setPlayers((prev) => {
        if (prev.some((p) => p.id === data.player.id)) return prev
        return [...prev, data.player]
      })
    })

    const unsubscribePlayerLeft = on('player_left', (raw) => {
      const data = raw as PlayerLeftPayload
      addMessage(`Player left: ${data.playerId}`)
      setPlayers((prev) => prev.filter((p) => p.id !== data.playerId))
    })

    const unsubscribeRoomReady = on('room_ready', (raw) => {
      const data = raw as RoomReadyPayload
      addMessage(`ROOM READY! ${data.message}`)
      setIsRoomReady(true)
    })

    const unsubscribeError = on('error', (raw) => {
      const data = raw as WsErrorPayload
      addMessage(`Error: ${data.code} - ${data.message}`)
      setError(data.message)
    })

    const unsubscribeRoomDeleted = on('room_deleted', (raw) => {
      const data = raw as RoomDeletedPayload
      addMessage(`Room deleted: ${data.roomCode}`)
      removeRoom(data.roomId)
    })

    return () => {
      unsubscribeJoined()
      unsubscribePlayerJoined()
      unsubscribePlayerLeft()
      unsubscribeRoomReady()
      unsubscribeError()
      unsubscribeRoomDeleted()
    }
  }, [on, addMessage, removeRoom])

  // Join room via WebSocket when connected
  useEffect(() => {
    if (isConnected && room) {
      addMessage(`Connected! Joining room ${code}...`)
      send('join_room', { roomCode: code })
    }
  }, [isConnected, room, code, send, addMessage])

  const handleLeaveRoom = async () => {
    try {
      const isHost = room?.hostId === session?.user?.id

      send('leave_room', { roomCode: code })
      await api.post(`/api/rooms/${code}/leave`, {})

      // If host leaves, room is deleted - update cache directly
      if (isHost && room) {
        removeRoom(room.id)
      }

      navigate({ to: '/rooms' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave room')
    }
  }

  if (sessionPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <p className="text-gray-600">Please sign in to view this room.</p>
      </div>
    )
  }

  if (error && !room) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <p className="text-red-600">{error}</p>
        <button onClick={() => navigate({ to: '/rooms' })} className="btn-primary mt-4">
          Back to Rooms
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <RoomHeader room={room} code={code} isConnected={isConnected} />

      {error && <AlertBox type="error" message={error} onClose={() => setError(null)} />}

      {isRoomReady && <AlertBox type="success" message="Room is full! Ready to play!" />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlayersList players={players} maxPlayers={room?.maxPlayers} />
        <WebSocketLog messages={messages} />
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        <button onClick={handleLeaveRoom} className="btn bg-red-500 text-white hover:bg-red-600">
          Leave Room
        </button>
        <button
          onClick={() => navigate({ to: '/rooms' })}
          className="btn bg-gray-500 text-white hover:bg-gray-600"
        >
          Back to Rooms
        </button>
      </div>
    </div>
  )
}
