import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const CELL_SIZE = 48

export function BackgroundRipple() {
  const containerRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ rows: 0, cols: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      setDimensions({
        rows: Math.ceil(height / CELL_SIZE) + 1,
        cols: Math.ceil(width / CELL_SIZE) + 1,
      })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const parent = containerRef.current?.parentElement
    if (!parent) return

    const onMove = (e: MouseEvent) => {
      if (!containerRef.current || !spotlightRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const mask = `radial-gradient(120px circle at ${x}px ${y}px, rgba(0,0,0,0.8), transparent)`
      spotlightRef.current.style.maskImage = mask
    }

    parent.addEventListener('mousemove', onMove)
    return () => parent.removeEventListener('mousemove', onMove)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const clickCol = Math.floor(x / CELL_SIZE)
    const clickRow = Math.floor(y / CELL_SIZE)

    const cells = containerRef.current.querySelectorAll<HTMLElement>('[data-ripple]')
    cells.forEach((cell) => {
      const r = Number(cell.dataset.row)
      const c = Number(cell.dataset.col)
      const distance = Math.sqrt((clickRow - r) ** 2 + (clickCol - c) ** 2)
      if (distance > 15) return
      cell.style.animation = 'none'
      void cell.offsetHeight
      cell.style.animation = `cell-ripple 0.8s ease-out ${distance * 0.05}s`
    })
  }, [])

  const gridLine = 'rgba(31, 31, 35, 0.4)'
  const accentLine = 'rgba(0, 255, 162, 0.3)'

  const baseGrid = [
    `repeating-linear-gradient(0deg, transparent, transparent ${CELL_SIZE - 1}px, ${gridLine} ${CELL_SIZE - 1}px, ${gridLine} ${CELL_SIZE}px)`,
    `repeating-linear-gradient(90deg, transparent, transparent ${CELL_SIZE - 1}px, ${gridLine} ${CELL_SIZE - 1}px, ${gridLine} ${CELL_SIZE}px)`,
  ].join(', ')

  const accentGrid = [
    `repeating-linear-gradient(0deg, transparent, transparent ${CELL_SIZE - 1}px, ${accentLine} ${CELL_SIZE - 1}px, ${accentLine} ${CELL_SIZE}px)`,
    `repeating-linear-gradient(90deg, transparent, transparent ${CELL_SIZE - 1}px, ${accentLine} ${CELL_SIZE - 1}px, ${accentLine} ${CELL_SIZE}px)`,
  ].join(', ')

  const cells = useMemo(() => {
    const result = []
    for (let r = 0; r < dimensions.rows; r++) {
      for (let c = 0; c < dimensions.cols; c++) {
        result.push(
          <div
            key={`${r}-${c}`}
            data-ripple=""
            data-row={r}
            data-col={c}
            className="absolute opacity-0"
            style={{
              left: c * CELL_SIZE,
              top: r * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: 'rgba(0, 255, 162, 0.12)',
            }}
          />
        )
      }
    }
    return result
  }, [dimensions])

  return (
    <div
      ref={containerRef}
      role="presentation"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick(e as unknown as React.MouseEvent)
      }}
      className="absolute inset-0 overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to bottom, black 40%, transparent 85%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 85%)',
      }}
    >
      {/* Base grid lines */}
      <div className="absolute inset-0" style={{ background: baseGrid }} />

      {/* Accent grid lines - spotlight follows mouse */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: accentGrid,
          maskImage:
            'radial-gradient(120px circle at -9999px -9999px, rgba(0,0,0,0.8), transparent)',
          WebkitMaskImage:
            'radial-gradient(120px circle at -9999px -9999px, rgba(0,0,0,0.8), transparent)',
        }}
      />

      {/* Ripple cells - invisible until animated on click */}
      <div className="absolute inset-0 z-20 pointer-events-none">{cells}</div>
    </div>
  )
}
