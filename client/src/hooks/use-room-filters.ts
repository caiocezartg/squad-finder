import { useState } from 'react'
import type { Game, Room } from '@/types'

interface UseRoomFiltersReturn {
  search: string
  setSearch: (v: string) => void
  filter: string
  setFilter: (v: string) => void
  sort: string
  setSort: (v: string) => void
  language: string
  setLanguage: (v: string) => void
  tagFilter: string
  setTagFilter: (v: string) => void
  hasActiveFilters: boolean
  applyFilters: (rooms: Room[]) => Room[]
}

export function useRoomFilters(gamesMap: Map<string, Game>): UseRoomFiltersReturn {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [language, setLanguage] = useState('all')
  const [tagFilter, setTagFilter] = useState('')

  const hasActiveFilters =
    search.trim().length > 0 ||
    filter !== 'all' ||
    language !== 'all' ||
    tagFilter.trim().length > 0

  function applyFilters(rooms: Room[]): Room[] {
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

  return {
    search,
    setSearch,
    filter,
    setFilter,
    sort,
    setSort,
    language,
    setLanguage,
    tagFilter,
    setTagFilter,
    hasActiveFilters,
    applyFilters,
  }
}
