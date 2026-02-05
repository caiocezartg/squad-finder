import type { FastifyReply, FastifyRequest } from 'fastify';

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
}

export class HealthController {
  async check(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const response: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '0.1.0',
    };

    await reply.status(200).send(response);
  }

  async readiness(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      await request.server.db.execute({ sql: 'SELECT 1', params: [] } as never);

      const response: HealthResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '0.1.0',
      };

      await reply.status(200).send(response);
    } catch {
      const response: HealthResponse = {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '0.1.0',
      };

      await reply.status(503).send(response);
    }
  }
}
