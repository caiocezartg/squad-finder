import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { db, closeDatabase, type Database } from '@infrastructure/database/drizzle';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}

async function databasePlugin(fastify: FastifyInstance): Promise<void> {
  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    await closeDatabase();
  });
}

export default fp(databasePlugin, {
  name: 'database',
  fastify: '5.x',
});
