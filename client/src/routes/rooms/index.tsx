import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/lib/auth-client'
import { api } from '@/lib/api'
import { useWebSocket } from '@/hooks/use-websocket'
import { useLobbyEvents } from '@/hooks/use-lobby-events'
import { RoomCard } from '@/components/rooms/room-card'
import { RoomFilters } from '@/components/rooms/room-filters'
import { CreateRoomModal } from '@/components/rooms/create-room-modal'
import { EmptyState } from '@/components/rooms/empty-state'
import { AlertBox } from '@/components/ui/alert-box'
import type { RoomsResponse, GamesResponse, CreateRoomResponse, Game } from '@/types'

export const Route = createFileRoute('/rooms/')({
  component: RoomsPage,
})

function RoomsPage() {
  const { data: session } = useSession()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const queryClient = useQueryClient()

  // WebSocket for real-time room list updates
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
  const { isConnected, send, on } = useWebSocket({
    url: wsUrl,
    autoConnect: true,
  })

  useLobbyEvents({ isConnected, send, on })

  // Fetch rooms
  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => api.get<RoomsResponse>('/api/rooms'),
    refetchOnWindowFocus: true,
  })

  // Fetch games
  const { data: gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ['games'],
    queryFn: () => api.get<GamesResponse>('/api/games'),
    staleTime: 60_000,
  })

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: (body: {
      name: string
      gameId: string
      maxPlayers?: number
      discordLink: string
    }) => api.post<CreateRoomResponse>('/api/rooms', body),
    onSuccess: (result) => {
      setModalOpen(false)
      navigate({ to: '/rooms/$code', params: { code: result.room.code } })
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create room')
    },
  })

  // Join room mutation
  const joinRoomMutation = useMutation({
    mutationFn: (roomCode: string) => api.post(`/api/rooms/${roomCode}/join`, {}),
    onSuccess: async (_, roomCode) => {
      await queryClient.invalidateQueries({ queryKey: ['rooms'] })
      navigate({ to: '/rooms/$code', params: { code: roomCode } })
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to join room')
    },
  })

  const rooms = useMemo(() => roomsData?.rooms ?? [], [roomsData])
  const games = useMemo(() => gamesData?.games ?? [], [gamesData])
  const loading = roomsLoading || gamesLoading

  const gamesMap = useMemo(() => new Map<string, Game>(games.map((g) => [g.id, g])), [games])

  // Filter and sort rooms
  const filteredRooms = useMemo(() => {
    let result = [...rooms]

    // Search by game name or room name
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter((room) => {
        const game = gamesMap.get(room.gameId)
        return game?.name.toLowerCase().includes(term) || room.name.toLowerCase().includes(term)
      })
    }

    // Filter
    if (filter === 'has-space') {
      result = result.filter((room) => (room.memberCount ?? 1) < room.maxPlayers)
    } else if (filter === 'almost-full') {
      result = result.filter((room) => {
        const members = room.memberCount ?? 1
        return members >= room.maxPlayers - 1 && members < room.maxPlayers
      })
    }

    // Sort
    if (sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sort === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }

    return result
  }, [rooms, search, filter, sort, gamesMap])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-52 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Explore Rooms</h1>
          <p className="mt-1 text-sm text-muted">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''} available
          </p>
        </div>
        {session?.user && (
          <button onClick={() => setModalOpen(true)} className="btn-accent gap-2">
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Room
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <AlertBox type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {/* Filters */}
      <RoomFilters
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
      />

      {/* Room cards grid */}
      {filteredRooms.length === 0 ? (
        <EmptyState
          title={search ? 'No rooms found' : 'No rooms yet'}
          description={
            search
              ? `No rooms match "${search}". Try a different search.`
              : 'Be the first to create a room and start a squad!'
          }
          action={
            session?.user
              ? {
                  label: 'Create Room',
                  onClick: () => setModalOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              game={gamesMap.get(room.gameId)}
              onJoin={(code) => {
                if (room.isMember) {
                  navigate({ to: '/rooms/$code', params: { code } })
                } else {
                  joinRoomMutation.mutate(code)
                }
              }}
              isLoading={!room.isMember && joinRoomMutation.isPending}
              currentMembers={room.memberCount}
            />
          ))}
        </div>
      )}

      {/* Create room modal */}
      {session?.user && (
        <CreateRoomModal
          games={games}
          onSubmit={(data) => createRoomMutation.mutate(data)}
          isLoading={createRoomMutation.isPending}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  )
}
