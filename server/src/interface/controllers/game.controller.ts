import type { FastifyReply, FastifyRequest } from 'fastify'
import type { IGameRepository } from '@domain/repositories/game.repository'

export interface GameControllerDeps {
  readonly gameRepository: IGameRepository
}

export class GameController {
  constructor(private readonly deps: GameControllerDeps) {}

  async list(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const games = await this.deps.gameRepository.findAll()

    await reply.send({ games })
  }
}
