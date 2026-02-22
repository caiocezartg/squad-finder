export type UserNotificationType = 'room_ready'

export interface UserNotificationPayload {
  readonly roomId: string
  readonly roomCode: string
  readonly roomName: string
  readonly gameName: string
  readonly players: ReadonlyArray<{ readonly name: string; readonly image: string | null }>
  readonly discordLink: string | null
}

export interface UserNotification {
  readonly id: string
  readonly userId: string
  readonly type: UserNotificationType
  readonly title: string
  readonly message: string
  readonly payload: UserNotificationPayload
  readonly readAt: Date | null
  readonly createdAt: Date
}

export interface CreateUserNotificationInput {
  readonly userId: string
  readonly type: UserNotificationType
  readonly title: string
  readonly message: string
  readonly payload: UserNotificationPayload
}
