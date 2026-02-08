import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { requireAuth } from '@interface/hooks/auth.hook';
import { UserController } from '@interface/controllers/user.controller';
import { userSchema } from '@squadfinder/schemas';

const errorResponse = z.object({
  error: z.string(),
  message: z.string(),
});

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  const userController = new UserController();

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
  });
}
