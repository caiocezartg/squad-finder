import type { FastifyRequest, FastifyReply } from 'fastify'
import { UnauthorizedError } from '@application/errors'

declare module 'fastify' {
  interface FastifyRequest {
    userId: string
  }
}

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  if (!request.session?.user?.id) {
    throw new UnauthorizedError()
  }
  request.userId = request.session.user.id
}
