import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@interface/hooks/auth.hook';
import { UserController } from '@interface/controllers/user.controller';

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  const userController = new UserController();

  fastify.get('/api/users/me', { preHandler: requireAuth }, userController.me.bind(userController));
}
