import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import websocket from '@fastify/websocket';
import { env } from '@config/env';
import databasePlugin from '@infrastructure/plugins/database.plugin';
import authPlugin from '@infrastructure/plugins/auth.plugin';
import wsPlugin from '@infrastructure/websocket/ws.plugin';
import { registerRoutes } from '@interface/routes';

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
  });

  await fastify.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
  });

  await fastify.register(websocket, {
    options: {
      maxPayload: 1048576,
    },
  });

  await fastify.register(databasePlugin);
  await fastify.register(authPlugin);
  await fastify.register(wsPlugin);
  await registerRoutes(fastify);

  return fastify;
}

async function start(): Promise<void> {
  const server = await buildServer();

  const shutdown = async (signal: string) => {
    server.log.info(`Received ${signal}, shutting down gracefully...`);
    await server.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  try {
    await server.listen({
      port: env.PORT,
      host: env.HOST,
    });

    server.log.info(`Server running at http://${env.HOST}:${env.PORT}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

start();
