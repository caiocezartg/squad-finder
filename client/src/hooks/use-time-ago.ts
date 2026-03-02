import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'

function getTimeAgo(date: Date, t: TFunction): string {
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return t('timeAgo.justNow')
  if (diffMin < 60) return t('timeAgo.minutesAgo', { count: diffMin })
  if (diffHour < 24) return t('timeAgo.hoursAgo', { count: diffHour })
  if (diffDay < 7) return t('timeAgo.daysAgo', { count: diffDay })
  return date.toLocaleDateString()
}

export function useTimeAgo(date: Date | string | undefined): string {
  const { t } = useTranslation()

  const [timeAgo, setTimeAgo] = useState(() => (date ? getTimeAgo(new Date(date), t) : ''))

  useEffect(() => {
    if (!date) return
    const parsed = new Date(date)

    setTimeAgo(getTimeAgo(parsed, t))

    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo(parsed, t))
    }, 30_000)

    return () => clearInterval(interval)
  }, [date, t])

  return timeAgo
}
