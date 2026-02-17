import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { requireAuth } from '@interface/hooks/auth.hook'
import { UserController } from '@interface/controllers/user.controller'
import { userSchema, userNotificationSchema } from '@squadfinder/schemas'
import { listNotificationsQuerySchema, notificationIdParamSchema } from '@application/dtos'

const errorResponse = z.object({
  error: z.string(),
  message: z.string(),
})

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>()
  const userController = new UserController()

  app.get('/api/users/me', {
    schema: {
      tags: ['Users'],
      summary: 'Get current user',
      description: 'Returns the authenticated user profile. Requires authentication.',
      security: [{ session: [] }],
      response: {
        200: z.object({ user: userSchema }),
        401: errorResponse,
        404: errorResponse,
      },
    },
    preHandler: requireAuth,
    handler: userController.me.bind(userController),
  })

  app.get('/api/notifications', {
    schema: {
      tags: ['Users'],
      summary: 'List user notifications',
      description: 'Returns recent notifications for the authenticated user.',
      security: [{ session: [] }],
      querystring: listNotificationsQuerySchema,
      response: {
        200: z.object({
          notifications: z.array(userNotificationSchema),
        }),
        401: errorResponse,
      },
    },
    preHandler: requireAuth,
    handler: userController.listNotifications.bind(userController),
  })

  app.post('/api/notifications/:id/read', {
    schema: {
      tags: ['Users'],
      summary: 'Mark notification as read',
      description: 'Marks a notification as read for the authenticated user.',
      security: [{ session: [] }],
      params: notificationIdParamSchema,
      response: {
        200: z.object({ success: z.boolean() }),
        401: errorResponse,
      },
    },
    preHandler: requireAuth,
    handler: userController.markNotificationAsRead.bind(userController),
  })
}
