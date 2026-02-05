import type { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.routes';

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(healthRoutes);
}
