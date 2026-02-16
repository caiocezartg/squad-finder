import type { FastifyReply, FastifyRequest } from 'fastify'
import { DrizzleUserRepository } from '@infrastructure/repositories/drizzle-user.repository'
import { GetUserUseCase } from '@application/use-cases/user/get-user.use-case'
import { UserNotFoundError, UnauthorizedError } from '@application/errors'

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
}
