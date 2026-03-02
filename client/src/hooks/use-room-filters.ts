import { useCallback } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import type { Game, Room } from '@/types'

const DEFAULTS = {
  search: '',
  filter: 'all' as const,
  sort: 'newest' as const,
  language: 'all' as const,
  tag: '',
  page: 1,
}

type SearchParams = {
  search?: string
  filter?: 'all' | 'has-space' | 'almost-full'
  sort?: 'newest' | 'oldest'
  language?: 'all' | 'pt-br' | 'en'
  tag?: string
  page?: number
  join?: string
}

interface UseRoomFiltersReturn {
  search: string
  filter: string
  sort: string
  language: string
  tagFilter: string
  page: number
  setSearch: (v: string) => void
  setFilter: (v: string) => void
  setSort: (v: string) => void
  setLanguage: (v: string) => void
  setTagFilter: (v: string) => void
  setPage: (v: number) => void
  hasActiveFilters: boolean
  applyFilters: (rooms: Room[]) => Room[]
}

export function useRoomFilters(gamesMap: Map<string, Game>): UseRoomFiltersReturn {
  const searchParams = useSearch({ from: '/rooms/' })
  const navigate = useNavigate({ from: '/rooms/' })

  const setParams = useCallback(
    (updates: Partial<SearchParams>) => {
      navigate({
        search: (prev) => {
          const merged = { ...prev, ...updates }
          // Omit default values to keep URLs clean
          return {
            ...(merged.search !== DEFAULTS.search && { search: merged.search }),
            ...(merged.filter !== DEFAULTS.filter && { filter: merged.filter }),
            ...(merged.sort !== DEFAULTS.sort && { sort: merged.sort }),
            ...(merged.language !== DEFAULTS.language && { language: merged.language }),
            ...(merged.tag !== DEFAULTS.tag && { tag: merged.tag }),
            ...(merged.page !== DEFAULTS.page && { page: merged.page }),
            ...(merged.join !== undefined && { join: merged.join }),
          }
        },
        replace: true,
      })
    },
    [navigate]
  )

  const setSearch = useCallback((v: string) => setParams({ search: v, page: 1 }), [setParams])
  const setFilter = useCallback(
    (v: string) => setParams({ filter: v as SearchParams['filter'], page: 1 }),
    [setParams]
  )
  const setSort = useCallback(
    (v: string) => setParams({ sort: v as SearchParams['sort'], page: 1 }),
    [setParams]
  )
  const setLanguage = useCallback(
    (v: string) => setParams({ language: v as SearchParams['language'], page: 1 }),
    [setParams]
  )
  const setTagFilter = useCallback((v: string) => setParams({ tag: v, page: 1 }), [setParams])
  const setPage = useCallback((v: number) => setParams({ page: v }), [setParams])

  const currentSearch = searchParams.search ?? DEFAULTS.search
  const currentFilter = searchParams.filter ?? DEFAULTS.filter
  const currentSort = searchParams.sort ?? DEFAULTS.sort
  const currentLanguage = searchParams.language ?? DEFAULTS.language
  const currentTag = searchParams.tag ?? DEFAULTS.tag
  const currentPage = searchParams.page ?? DEFAULTS.page

  const hasActiveFilters =
    currentSearch.trim().length > 0 ||
    currentFilter !== 'all' ||
    currentLanguage !== 'all' ||
    currentTag.trim().length > 0

  function applyFilters(rooms: Room[]): Room[] {
    let result = [...rooms]

    if (currentSearch.trim()) {
      const term = currentSearch.toLowerCase()
      result = result.filter((room) => {
        const game = gamesMap.get(room.gameId)
        return game?.name.toLowerCase().includes(term) || room.name.toLowerCase().includes(term)
      })
    }

    if (currentFilter === 'has-space') {
      result = result.filter((room) => (room.memberCount ?? 1) < room.maxPlayers)
    } else if (currentFilter === 'almost-full') {
      result = result.filter((room) => {
        const members = room.memberCount ?? 1
        return members >= room.maxPlayers - 1 && members < room.maxPlayers
      })
    }

    if (currentLanguage !== 'all') {
      result = result.filter((room) => room.language === currentLanguage)
    }

    if (currentTag.trim()) {
      const term = currentTag.trim().toLowerCase().replace(/^#/, '')
      result = result.filter((room) => room.tags.some((t) => t.toLowerCase().includes(term)))
    }

    if (currentSort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (currentSort === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }

    return result
  }

  return {
    search: currentSearch,
    filter: currentFilter,
    sort: currentSort,
    language: currentLanguage,
    tagFilter: currentTag,
    page: currentPage,
    setSearch,
    setFilter,
    setSort,
    setLanguage,
    setTagFilter,
    setPage,
    hasActiveFilters,
    applyFilters,
  }
}
