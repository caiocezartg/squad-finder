import type {
  CreateUserNotificationInput,
  UserNotification,
} from '@domain/entities/user-notification.entity'

export interface IUserNotificationRepository {
  findByUserId(userId: string, limit?: number): Promise<UserNotification[]>
  create(input: CreateUserNotificationInput): Promise<UserNotification>
  markAsRead(id: string, userId: string): Promise<boolean>
}
