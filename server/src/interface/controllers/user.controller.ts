import type { FastifyReply, FastifyRequest } from 'fastify'
import { DrizzleUserRepository } from '@infrastructure/repositories/drizzle-user.repository'
import { DrizzleUserNotificationRepository } from '@infrastructure/repositories/drizzle-user-notification.repository'
import { GetUserUseCase } from '@application/use-cases/user/get-user.use-case'
import { UserNotFoundError, UnauthorizedError } from '@application/errors'
import { listNotificationsQuerySchema, notificationIdParamSchema } from '@application/dtos'

function getUserId(request: FastifyRequest): string {
  if (!request.session?.user?.id) {
    throw new UnauthorizedError()
  }
  return request.session.user.id
}

export class UserController {
  async me(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = getUserId(request)

    const userRepository = new DrizzleUserRepository(request.server.db)
    const useCase = new GetUserUseCase(userRepository)
    const result = await useCase.execute({ id: userId })

    if (!result.user) {
      throw new UserNotFoundError(userId)
    }

    await reply.send({ user: result.user })
  }

  async listNotifications(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = getUserId(request)
    const query = listNotificationsQuerySchema.parse(request.query)
    const limit = query.limit ?? 20

    const userNotificationRepository = new DrizzleUserNotificationRepository(request.server.db)
    const notifications = await userNotificationRepository.findByUserId(userId, limit)

    await reply.send({ notifications })
  }

  async markNotificationAsRead(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = getUserId(request)
    const params = notificationIdParamSchema.parse(request.params)

    const userNotificationRepository = new DrizzleUserNotificationRepository(request.server.db)
    const success = await userNotificationRepository.markAsRead(params.id, userId)

    await reply.send({ success })
  }
}
