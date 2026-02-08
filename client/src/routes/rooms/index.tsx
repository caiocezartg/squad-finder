import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useSession } from '@/lib/auth-client'
import { api } from '@/lib/api'
import { useWebSocket } from '@/hooks/use-websocket'
import { useLobbyEvents } from '@/hooks/use-lobby-events'
import { CreateRoomForm } from '@/components/rooms/create-room-form'
import { RoomCard } from '@/components/rooms/room-card'
import { ConnectionStatus } from '@/components/ui/connection-status'
import { AlertBox } from '@/components/ui/alert-box'
import type { RoomsResponse, GamesResponse, CreateRoomResponse, Game } from '@/types'

export const Route = createFileRoute('/rooms/')({
  component: RoomsPage,
})

function RoomsPage() {
  const { data: session, isPending: sessionPending } = useSession()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  // WebSocket for real-time room list updates
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
  const { isConnected, send, on } = useWebSocket({
    url: wsUrl,
    autoConnect: true,
  })

  // Lobby subscription with real-time events
  const { isSubscribed } = useLobbyEvents({ isConnected, send, on })

  // Fetch rooms
  const {
    data: roomsData,
    isLoading: roomsLoading,
    refetch: refetchRooms,
  } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => api.get<RoomsResponse>('/api/rooms'),
    refetchOnWindowFocus: true,
  })

  // Fetch games
  const { data: gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ['games'],
    queryFn: () => api.get<GamesResponse>('/api/games'),
    staleTime: 60000,
  })

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: (body: { name: string; gameId: string; maxPlayers?: number }) =>
      api.post<CreateRoomResponse>('/api/rooms', body),
    onSuccess: (result) => {
      navigate({ to: '/rooms/$code', params: { code: result.room.code } })
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create room')
    },
  })

  // Join room mutation
  const joinRoomMutation = useMutation({
    mutationFn: (roomCode: string) => api.post(`/api/rooms/${roomCode}/join`, {}),
    onSuccess: (_, roomCode) => {
      navigate({ to: '/rooms/$code', params: { code: roomCode } })
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to join room')
    },
  })

  const rooms = roomsData?.rooms ?? []
  const games = gamesData?.games ?? []
  const loading = roomsLoading || gamesLoading

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
        <p className="text-gray-600">Please sign in to view rooms.</p>
      </div>
    )
  }

  const gamesMap = new Map<string, Game>(games.map((g) => [g.id, g]))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Rooms</h1>

      {error && <AlertBox type="error" message={error} onClose={() => setError(null)} />}

      <CreateRoomForm
        games={games}
        onSubmit={(data) => createRoomMutation.mutate(data)}
        isLoading={createRoomMutation.isPending}
      />

      {/* Available Rooms */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Available Rooms{' '}
            {isConnected && (
              <ConnectionStatus isConnected={isConnected} isSubscribed={isSubscribed} />
            )}
          </h2>
          <button
            onClick={() => refetchRooms()}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Refresh
          </button>
        </div>
        {rooms.length === 0 ? (
          <p className="text-gray-500">No rooms available. Create one!</p>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                game={gamesMap.get(room.gameId)}
                onJoin={(code) => joinRoomMutation.mutate(code)}
                isLoading={joinRoomMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
