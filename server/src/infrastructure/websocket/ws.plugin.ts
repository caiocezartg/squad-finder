import type { FastifyInstance } from 'fastify';
import type { WebSocket } from '@fastify/websocket';
import fp from 'fastify-plugin';
import { wsIncomingMessageSchema, type PongMessage, type WsClient } from './types';
import {
  handleJoinRoom,
  handleLeaveRoom,
  handleDisconnect,
  sendError,
  setClientData,
} from './handlers/room.handler';

async function wsPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.get('/ws', { websocket: true }, (socket: WebSocket) => {
    const client: WsClient = {
      userId: '',
      roomCode: null,
      send: (message: unknown) => {
        if (socket.readyState === socket.OPEN) {
          socket.send(JSON.stringify(message));
        }
      },
    };

    setClientData(socket, client);

    socket.on('message', (rawData: Buffer | ArrayBuffer | Buffer[]) => {
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
            handleJoinRoom(socket, message);
            break;
          case 'leave_room':
            handleLeaveRoom(socket, message);
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
      } catch {
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
