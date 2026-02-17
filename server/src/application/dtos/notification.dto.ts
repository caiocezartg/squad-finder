import { z } from 'zod'

export const notificationIdParamSchema = z.object({
  id: z.uuid(),
})

export const listNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
})

export type NotificationIdParamDto = z.infer<typeof notificationIdParamSchema>
export type ListNotificationsQueryDto = z.infer<typeof listNotificationsQuerySchema>
