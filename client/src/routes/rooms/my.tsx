import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/lib/auth-client'
import { api } from '@/lib/api'
import { RoomCard } from '@/components/rooms/room-card'
import { RoomFilters } from '@/components/rooms/room-filters'
import { CreateRoomModal } from '@/components/rooms/create-room-modal'
import { Plus } from 'lucide-react'
import type { MyRoomsResponse, GamesResponse, CreateRoomResponse, Game } from '@/types'

export const Route = createFileRoute('/rooms/my')({
  component: MyRoomsPage,
})

function MyRoomsPage() {
  const { data: session, isPending: sessionLoading } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [language, setLanguage] = useState('all')
  const [tagFilter, setTagFilter] = useState('')

  // Redirect unauthenticated users
  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      navigate({ to: '/' })
    }
  }, [sessionLoading, session?.user, navigate])

  // Fetch my rooms
  const { data: myRoomsData, isLoading: myRoomsLoading } = useQuery({
    queryKey: ['my-rooms'],
    queryFn: () => api.get<MyRoomsResponse>('/api/rooms/my'),
    enabled: !!session?.user,
    refetchOnWindowFocus: true,
  })

  // Fetch games
  const { data: gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ['games'],
    queryFn: () => api.get<GamesResponse>('/api/games'),
    staleTime: 60_000,
    enabled: !!session?.user,
  })

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: (body: {
      name: string
      gameId: string
      maxPlayers?: number
      discordLink: string
      tags: string[]
      language: 'en' | 'pt-br'
    }) => api.post<CreateRoomResponse>('/api/rooms', body),
    onSuccess: (result) => {
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['my-rooms'] })
      navigate({ to: '/rooms/$code', params: { code: result.room.code } })
    },
  })

  const loading = sessionLoading || myRoomsLoading || gamesLoading

  const gamesMap = useMemo(
    () => new Map<string, Game>((gamesData?.games ?? []).map((g) => [g.id, g])),
    [gamesData?.games]
  )

  // Filter and sort helper applied to any room array
  const applyFilters = useMemo(() => {
    return (rooms: MyRoomsResponse['hosted']) => {
      let result = [...rooms]

      if (search.trim()) {
        const term = search.toLowerCase()
        result = result.filter((room) => {
          const game = gamesMap.get(room.gameId)
          return game?.name.toLowerCase().includes(term) || room.name.toLowerCase().includes(term)
        })
      }

      if (filter === 'has-space') {
        result = result.filter((room) => (room.memberCount ?? 1) < room.maxPlayers)
      } else if (filter === 'almost-full') {
        result = result.filter((room) => {
          const members = room.memberCount ?? 1
          return members >= room.maxPlayers - 1 && members < room.maxPlayers
        })
      }

      if (language !== 'all') {
        result = result.filter((room) => room.language === language)
      }

      if (tagFilter.trim()) {
        const term = tagFilter.trim().toLowerCase().replace(/^#/, '')
        result = result.filter((room) => room.tags.some((t) => t.toLowerCase().includes(term)))
      }

      if (sort === 'newest') {
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      } else if (sort === 'oldest') {
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      }

      return result
    }
  }, [search, filter, sort, language, tagFilter, gamesMap])

  const filteredHosted = useMemo(
    () => applyFilters(myRoomsData?.hosted ?? []),
    [applyFilters, myRoomsData?.hosted]
  )

  const filteredJoined = useMemo(
    () => applyFilters(myRoomsData?.joined ?? []),
    [applyFilters, myRoomsData?.joined]
  )

  const hasActiveFilters =
    search.trim().length > 0 || filter !== 'all' || language !== 'all' || tagFilter.trim().length > 0

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-64 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">My Rooms</h1>
          <p className="mt-1 text-sm text-muted">Rooms you created or joined</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-accent gap-2">
          <Plus className="size-4" />
          Create new room
        </button>
      </div>

      {/* Filters */}
      <RoomFilters
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        language={language}
        onLanguageChange={setLanguage}
        tagFilter={tagFilter}
        onTagFilterChange={setTagFilter}
      />

      {/* Rooms I Created */}
      <section className="mb-10">
        <h2 className="font-heading text-lg font-semibold mb-4 text-offwhite">Rooms I Created</h2>
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
      </section>

      {/* Rooms I Joined */}
      <section>
        <h2 className="font-heading text-lg font-semibold mb-4 text-offwhite">Rooms I Joined</h2>
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
      </section>

      {/* Create room modal */}
      <CreateRoomModal
        games={gamesData?.games ?? []}
        onSubmit={(data) => createRoomMutation.mutateAsync(data)}
        isLoading={createRoomMutation.isPending}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}
