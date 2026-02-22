import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { getUserFriendlyError } from '@/lib/error-messages'
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
    onError: (err) => {
      toast.error(getUserFriendlyError(err))
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      api.post<{ success: boolean; count: number }>('/api/notifications/read-all', {}),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (err) => {
      toast.error(getUserFriendlyError(err))
    },
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) =>
      api.delete<{ success: boolean }>(`/api/notifications/${notificationId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (err) => {
      toast.error(getUserFriendlyError(err))
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
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    isDeletingNotification: deleteNotificationMutation.isPending,
  }
}
