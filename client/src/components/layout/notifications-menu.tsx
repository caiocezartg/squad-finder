import { useNavigate } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/hooks/use-notifications'

interface NotificationsMenuProps {
  readonly enabled: boolean
  readonly isOpen: boolean
  readonly onToggle: () => void
  readonly onClose: () => void
}

export function NotificationsMenu({ enabled, isOpen, onToggle, onClose }: NotificationsMenuProps) {
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, isMarkingAsRead } = useNotifications({
    enabled,
    limit: 10,
  })

  const handleNotificationClick = async (
    notificationId: string,
    roomCode: string,
    readAt: Date | null
  ) => {
    if (!readAt) {
      await markAsRead(notificationId)
    }

    onClose()
    await navigate({ to: '/rooms/$code', params: { code: roomCode } })
  }

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="relative flex items-center justify-center rounded-lg p-2 text-muted hover:bg-surface-hover hover:text-offwhite transition-colors"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-border bg-surface p-2 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between border-b border-border px-2 pb-2">
            <p className="text-sm font-semibold text-offwhite">Notifications</p>
            <span className="text-xs text-muted">{unreadCount} unread</span>
          </div>

          <div className="mt-2 max-h-80 overflow-y-auto space-y-1">
            {notifications.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-muted">No notifications yet.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  disabled={isMarkingAsRead}
                  onClick={() =>
                    handleNotificationClick(
                      notification.id,
                      notification.payload.roomCode,
                      notification.readAt
                    )
                  }
                  className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                    notification.readAt
                      ? 'bg-surface text-muted hover:bg-surface-hover'
                      : 'bg-accent/5 text-offwhite hover:bg-accent/10 border border-accent/20'
                  }`}
                >
                  <p className="text-xs font-semibold">{notification.title}</p>
                  <p className="mt-1 text-xs">{notification.message}</p>
                  <p className="mt-1 text-[11px] text-muted">Room {notification.payload.roomCode}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
