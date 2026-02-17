import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { NotificationsResponse } from '@/types'

interface UseNotificationsOptions {
  enabled: boolean
  limit?: number
}

export function useNotifications(options: UseNotificationsOptions) {
  const { enabled, limit = 20 } = options
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['notifications', { limit }],
    queryFn: () => api.get<NotificationsResponse>(`/api/notifications?limit=${limit}`),
    enabled,
    refetchInterval: enabled ? 30_000 : false,
    staleTime: 15_000,
  })

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      api.post<{ success: boolean }>(`/api/notifications/${notificationId}/read`, {}),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const notifications = useMemo(() => query.data?.notifications ?? [], [query.data?.notifications])
  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.readAt === null).length,
    [notifications]
  )

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    markAsRead: markAsReadMutation.mutateAsync,
    isMarkingAsRead: markAsReadMutation.isPending,
  }
}
