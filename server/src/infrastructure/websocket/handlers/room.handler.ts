import type { WebSocket } from '@fastify/websocket';
import type {
  JoinRoomMessage,
  LeaveRoomMessage,
  WsClient,
  RoomJoinedMessage,
  PlayerJoinedMessage,
  PlayerLeftMessage,
  ErrorMessage,
} from '../types';

type RoomClients = Map<string, Set<WebSocket>>;

const rooms: RoomClients = new Map();
const clientData: WeakMap<WebSocket, WsClient> = new WeakMap();

export function setClientData(socket: WebSocket, data: WsClient): void {
  clientData.set(socket, data);
}

export function getClientData(socket: WebSocket): WsClient | undefined {
  return clientData.get(socket);
}

function sendToSocket(socket: WebSocket, message: unknown): void {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function broadcastToRoom(roomCode: string, message: unknown, excludeSocket?: WebSocket): void {
  const roomSockets = rooms.get(roomCode);
  if (!roomSockets) return;

  for (const socket of roomSockets) {
    if (socket !== excludeSocket) {
      sendToSocket(socket, message);
    }
  }
}

export function handleJoinRoom(socket: WebSocket, message: JoinRoomMessage): void {
  const { roomCode, userId } = message.payload;

  let roomSockets = rooms.get(roomCode);
  if (!roomSockets) {
    roomSockets = new Set();
    rooms.set(roomCode, roomSockets);
  }

  roomSockets.add(socket);

  const client = getClientData(socket);
  if (client) {
    client.roomCode = roomCode;
    client.userId = userId;
  }

  const joinedMessage: RoomJoinedMessage = {
    type: 'room_joined',
    timestamp: Date.now(),
    payload: {
      roomId: 'placeholder-room-id',
      roomCode,
      players: [],
    },
  };
  sendToSocket(socket, joinedMessage);

  const playerJoinedMessage: PlayerJoinedMessage = {
    type: 'player_joined',
    timestamp: Date.now(),
    payload: {
      player: {
        id: userId,
        name: 'Player',
        isHost: roomSockets.size === 1,
      },
    },
  };
  broadcastToRoom(roomCode, playerJoinedMessage, socket);
}

export function handleLeaveRoom(socket: WebSocket, message: LeaveRoomMessage): void {
  const { roomCode, userId } = message.payload;

  const roomSockets = rooms.get(roomCode);
  if (roomSockets) {
    roomSockets.delete(socket);

    if (roomSockets.size === 0) {
      rooms.delete(roomCode);
    } else {
      const playerLeftMessage: PlayerLeftMessage = {
        type: 'player_left',
        timestamp: Date.now(),
        payload: {
          playerId: userId,
        },
      };
      broadcastToRoom(roomCode, playerLeftMessage);
    }
  }

  const client = getClientData(socket);
  if (client) {
    client.roomCode = null;
  }
}

export function handleDisconnect(socket: WebSocket): void {
  const client = getClientData(socket);
  if (!client?.roomCode) return;

  const roomSockets = rooms.get(client.roomCode);
  if (roomSockets) {
    roomSockets.delete(socket);

    if (roomSockets.size === 0) {
      rooms.delete(client.roomCode);
    } else {
      const playerLeftMessage: PlayerLeftMessage = {
        type: 'player_left',
        timestamp: Date.now(),
        payload: {
          playerId: client.userId,
        },
      };
      broadcastToRoom(client.roomCode, playerLeftMessage);
    }
  }
}

export function sendError(socket: WebSocket, code: string, message: string): void {
  const errorMessage: ErrorMessage = {
    type: 'error',
    timestamp: Date.now(),
    payload: {
      code,
      message,
    },
  };
  sendToSocket(socket, errorMessage);
}
