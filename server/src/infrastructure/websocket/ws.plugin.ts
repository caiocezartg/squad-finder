import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { WebSocket } from '@fastify/websocket';
import fp from 'fastify-plugin';
import { wsIncomingMessageSchema, type PongMessage, type WsClient } from './types';
import {
  handleJoinRoom,
  handleLeaveRoom,
  handleDisconnect,
  handleSubscribeLobby,
  handleUnsubscribeLobby,
  sendError,
  setClientData,
} from './handlers/room.handler';

async function wsPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.get('/ws', { websocket: true }, async (socket: WebSocket, request: FastifyRequest) => {
    // Debug: log cookies and session state
    fastify.log.info({
      cookies: request.headers.cookie,
      hasSession: !!request.session,
      sessionUser: request.session?.user?.id,
    }, 'WebSocket connection attempt');

    // Session is already populated by auth.plugin.ts preHandler hook
    const session = request.session;

    if (!session?.user?.id) {
      fastify.log.warn('WebSocket auth failed - no session');
      sendError(socket, 'UNAUTHORIZED', 'Authentication required');
      socket.close(4001, 'Unauthorized');
      return;
    }

    fastify.log.info({ userId: session.user.id }, 'WebSocket authenticated');

    const client: WsClient = {
      userId: session.user.id,
      userName: session.user.name,
      userImage: session.user.image ?? null,
      roomCode: null,
      isInLobby: false,
      send: (message: unknown) => {
        if (socket.readyState === socket.OPEN) {
          socket.send(JSON.stringify(message));
        }
      },
    };

    setClientData(socket, client);

    const db = fastify.db;

    socket.on('message', async (rawData: Buffer | ArrayBuffer | Buffer[]) => {
      try {
        const data: unknown = JSON.parse(rawData.toString());
        const result = wsIncomingMessageSchema.safeParse(data);

        if (!result.success) {
          sendError(socket, 'INVALID_MESSAGE', 'Invalid message format');
          return;
        }

        const message = result.data;

        switch (message.type) {
          case 'join_room':
            await handleJoinRoom(socket, message, db);
            break;
          case 'leave_room':
            await handleLeaveRoom(socket, message, db);
            break;
          case 'subscribe_lobby':
            handleSubscribeLobby(socket);
            break;
          case 'unsubscribe_lobby':
            handleUnsubscribeLobby(socket);
            break;
          case 'ping': {
            const pongMessage: PongMessage = {
              type: 'pong',
              timestamp: Date.now(),
            };
            client.send(pongMessage);
            break;
          }
        }
      } catch (error) {
        fastify.log.error(error, 'WebSocket message handling error');
        sendError(socket, 'PARSE_ERROR', 'Failed to parse message');
      }
    });

    socket.on('close', () => {
      handleDisconnect(socket);
    });

    socket.on('error', (error: Error) => {
      fastify.log.error(error, 'WebSocket error');
      handleDisconnect(socket);
    });
  });
}

export default fp(wsPlugin, {
  name: 'websocket-handler',
  fastify: '5.x',
  dependencies: ['@fastify/websocket'],
});
