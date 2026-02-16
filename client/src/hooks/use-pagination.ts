import { useState, useMemo, useCallback } from 'react'

const DEFAULT_PAGE_SIZE = 6

interface UsePaginationOptions {
  totalItems: number
  pageSize?: number
  initialPage?: number
}

interface UsePaginationReturn {
  currentPage: number
  totalPages: number
  startIndex: number
  endIndex: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  resetPage: () => void
  pageRange: number[]
}

export function usePagination({
  totalItems,
  pageSize = DEFAULT_PAGE_SIZE,
  initialPage = 1,
}: UsePaginationOptions): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // Clamp current page if totalPages shrinks (e.g., filter changes reduce results)
  const safePage = Math.min(currentPage, totalPages)
  if (safePage !== currentPage) {
    setCurrentPage(safePage)
  }

  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, totalPages))
      setCurrentPage(clamped)
    },
    [totalPages]
  )

  const nextPage = () => goToPage(safePage + 1)
  const previousPage = () => goToPage(safePage - 1)
  const resetPage = () => setCurrentPage(1)

  // Generate page numbers to display.
  // For <= 7 pages show all; otherwise show first, last, current +-1 with gaps.
  const pageRange = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages = new Set<number>()
    pages.add(1)
    pages.add(totalPages)
    pages.add(safePage)
    if (safePage > 1) pages.add(safePage - 1)
    if (safePage < totalPages) pages.add(safePage + 1)

    return Array.from(pages).sort((a, b) => a - b)
  }, [totalPages, safePage])

  return {
    currentPage: safePage,
    totalPages,
    startIndex,
    endIndex,
    hasPreviousPage: safePage > 1,
    hasNextPage: safePage < totalPages,
    goToPage,
    nextPage,
    previousPage,
    resetPage,
    pageRange,
  }
}
