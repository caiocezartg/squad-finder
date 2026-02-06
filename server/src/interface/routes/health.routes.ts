import type { FastifyInstance } from 'fastify';
import { HealthController } from '@interface/controllers/health.controller';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = new HealthController();

  fastify.get('/health', controller.check.bind(controller));
  fastify.get('/health/ready', controller.readiness.bind(controller));
}
