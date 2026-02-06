import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@interface/hooks/auth.hook';
import { RoomController } from '@interface/controllers/room.controller';
import { GameController } from '@interface/controllers/game.controller';

export async function roomRoutes(fastify: FastifyInstance): Promise<void> {
  const roomController = new RoomController();
  const gameController = new GameController();

  // Games
  fastify.get('/api/games', gameController.list.bind(gameController));

  // Rooms
  fastify.get('/api/rooms', roomController.list.bind(roomController));
  fastify.get('/api/rooms/:code', roomController.getByCode.bind(roomController));
  fastify.post('/api/rooms', { preHandler: requireAuth }, roomController.create.bind(roomController));
  fastify.post('/api/rooms/:code/join', { preHandler: requireAuth }, roomController.join.bind(roomController));
  fastify.post('/api/rooms/:code/leave', { preHandler: requireAuth }, roomController.leave.bind(roomController));
}
