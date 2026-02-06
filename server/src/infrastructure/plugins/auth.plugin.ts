import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { auth, type Session } from '@infrastructure/auth';

declare module 'fastify' {
  interface FastifyInstance {
    auth: typeof auth;
  }
  interface FastifyRequest {
    session: Session | null;
  }
}

async function authPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.decorate('auth', auth);
  fastify.decorateRequest('session', null);

  // Authentication Route Handler using Web API Request/Response
  fastify.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request: FastifyRequest, reply: FastifyReply) {
      try {
        const url = new URL(request.url, `http://${request.headers.host}`);

        const headers = new Headers();
        Object.entries(request.headers).forEach(([key, value]) => {
          if (value) headers.append(key, Array.isArray(value) ? value.join(', ') : value);
        });

        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        });

        const response = await auth.handler(req);

        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));

        const body = response.body ? await response.text() : null;
        reply.send(body);
      } catch (error) {
        fastify.log.error(error, 'Authentication Error');
        reply.status(500).send({
          error: 'Internal authentication error',
          code: 'AUTH_FAILURE',
        });
      }
    },
  });

  // Session hook for non-auth routes
  fastify.addHook('preHandler', async (request: FastifyRequest) => {
    if (request.url.startsWith('/api/auth')) return;

    const session = await auth.api.getSession({
      headers: request.headers as Record<string, string>,
    });
    request.session = session;
  });
}

export default fp(authPlugin, {
  name: 'auth',
  fastify: '5.x',
});
