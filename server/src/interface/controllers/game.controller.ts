import type { FastifyReply, FastifyRequest } from 'fastify';
import { DrizzleGameRepository } from '@infrastructure/repositories/drizzle-game.repository';

export class GameController {
  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const gameRepository = new DrizzleGameRepository(request.server.db);
    const games = await gameRepository.findAll();

    await reply.send({ games });
  }
}
