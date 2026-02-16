import { Fragment } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageRange: number[]
  hasPreviousPage: boolean
  hasNextPage: boolean
  onPageChange: (page: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
}

export function Pagination({
  currentPage,
  totalPages,
  pageRange,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  onPreviousPage,
  onNextPage,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={onPreviousPage}
        disabled={!hasPreviousPage}
        aria-label="Go to previous page"
        className={cn(
          'flex items-center justify-center size-9 rounded-lg text-sm transition-colors',
          'border border-border-light',
          hasPreviousPage
            ? 'text-offwhite hover:bg-surface-hover hover:border-muted/30'
            : 'text-muted/40 cursor-not-allowed'
        )}
      >
        <ChevronLeft className="size-4" />
      </button>

      {pageRange.map((page, index) => {
        const prev = pageRange[index - 1]
        const showEllipsis = index > 0 && prev !== undefined && page - prev > 1

        return (
          <Fragment key={page}>
            {showEllipsis && (
              <span
                className="flex items-center justify-center size-9 text-xs text-muted"
                aria-hidden
              >
                ...
              </span>
            )}
            <button
              onClick={() => onPageChange(page)}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              className={cn(
                'flex items-center justify-center size-9 rounded-lg text-sm font-medium transition-colors',
                page === currentPage
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-muted border border-transparent hover:text-offwhite hover:bg-surface-hover hover:border-border-light'
              )}
            >
              {page}
            </button>
          </Fragment>
        )
      })}

      <button
        onClick={onNextPage}
        disabled={!hasNextPage}
        aria-label="Go to next page"
        className={cn(
          'flex items-center justify-center size-9 rounded-lg text-sm transition-colors',
          'border border-border-light',
          hasNextPage
            ? 'text-offwhite hover:bg-surface-hover hover:border-muted/30'
            : 'text-muted/40 cursor-not-allowed'
        )}
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}
