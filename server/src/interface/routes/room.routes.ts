import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { requireAuth } from '@interface/hooks/auth.hook';
import { RoomController } from '@interface/controllers/room.controller';
import { GameController } from '@interface/controllers/game.controller';
import { gameSchema, roomSchema, roomMemberSchema, createRoomInputSchema } from '@squadfinder/schemas';
import { roomCodeParamSchema } from '@application/dtos';

const errorResponse = z.object({
  error: z.string(),
  message: z.string(),
  details: z
    .array(z.object({ field: z.string(), message: z.string() }))
    .optional(),
});

export async function roomRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  const roomController = new RoomController();
  const gameController = new GameController();

  // Games
  app.get('/api/games', {
    schema: {
      tags: ['Games'],
      summary: 'List all games',
      description: 'Returns the catalog of all supported games.',
      response: {
        200: z.object({ games: z.array(gameSchema) }),
      },
    },
    handler: gameController.list.bind(gameController),
  });

  // Rooms
  app.get('/api/rooms', {
    schema: {
      tags: ['Rooms'],
      summary: 'List available rooms',
      description: 'Returns all rooms with "waiting" status that can be joined.',
      response: {
        200: z.object({ rooms: z.array(roomSchema) }),
      },
    },
    handler: roomController.list.bind(roomController),
  });

  app.get('/api/rooms/:code', {
    schema: {
      tags: ['Rooms'],
      summary: 'Get room by code',
      description: 'Returns a specific room by its 6-character code.',
      params: roomCodeParamSchema,
      response: {
        200: z.object({ room: roomSchema }),
        404: errorResponse,
      },
    },
    handler: roomController.getByCode.bind(roomController),
  });

  app.post('/api/rooms', {
    schema: {
      tags: ['Rooms'],
      summary: 'Create a room',
      description:
        'Creates a new room and adds the authenticated user as host. Requires authentication.',
      security: [{ session: [] }],
      body: createRoomInputSchema,
      response: {
        201: z.object({ room: roomSchema }),
        400: errorResponse,
        401: errorResponse,
      },
    },
    preHandler: requireAuth,
    handler: roomController.create.bind(roomController),
  });

  app.post('/api/rooms/:code/join', {
    schema: {
      tags: ['Rooms'],
      summary: 'Join a room',
      description:
        'Joins an existing room by its code. Room must be in "waiting" status and not full. Requires authentication.',
      security: [{ session: [] }],
      params: roomCodeParamSchema,
      response: {
        200: z.object({
          message: z.string(),
          roomMember: roomMemberSchema,
        }),
        401: errorResponse,
        404: errorResponse,
        422: errorResponse,
      },
    },
    preHandler: requireAuth,
    handler: roomController.join.bind(roomController),
  });

  app.post('/api/rooms/:code/leave', {
    schema: {
      tags: ['Rooms'],
      summary: 'Leave a room',
      description:
        'Leaves a room by its code. If the host leaves, the room is deleted. Requires authentication.',
      security: [{ session: [] }],
      params: roomCodeParamSchema,
      response: {
        200: z.object({
          message: z.string(),
          success: z.boolean(),
        }),
        401: errorResponse,
        404: errorResponse,
        422: errorResponse,
      },
    },
    preHandler: requireAuth,
    handler: roomController.leave.bind(roomController),
  });
}
