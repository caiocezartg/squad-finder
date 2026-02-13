import type { WebSocket } from '@fastify/websocket';
import type { Database } from '@infrastructure/database/drizzle';
import { DrizzleRoomRepository } from '@infrastructure/repositories/drizzle-room.repository';
import { DrizzleRoomMemberRepository } from '@infrastructure/repositories/drizzle-room-member.repository';
import { DrizzleUserRepository } from '@infrastructure/repositories/drizzle-user.repository';
import type {
  JoinRoomMessage,
  LeaveRoomMessage,
  WsClient,
  RoomJoinedMessage,
  PlayerJoinedMessage,
  PlayerLeftMessage,
  RoomReadyMessage,
  ErrorMessage,
  LobbySubscribedMessage,
  RoomCreatedMessage,
  RoomDeletedMessage,
} from '../types';
import type { Room } from '@domain/entities/room.entity';

type RoomClients = Map<string, Set<WebSocket>>;

// In-memory map for tracking WebSocket connections per room
const rooms: RoomClients = new Map();
const clientData: WeakMap<WebSocket, WsClient> = new WeakMap();

// Track lobby subscribers (users viewing the room list)
const lobbySubscribers: Set<WebSocket> = new Set();

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

export async function handleJoinRoom(
  socket: WebSocket,
  message: JoinRoomMessage,
  db: Database,
): Promise<void> {
  const { roomCode } = message.payload;
  const client = getClientData(socket);

  if (!client) {
    sendError(socket, 'INVALID_CLIENT', 'Client not initialized');
    return;
  }

  const roomRepository = new DrizzleRoomRepository(db);
  const roomMemberRepository = new DrizzleRoomMemberRepository(db);
  const userRepository = new DrizzleUserRepository(db);

  // Validate room exists
  const room = await roomRepository.findByCode(roomCode);
  if (!room) {
    sendError(socket, 'ROOM_NOT_FOUND', `Room "${roomCode}" not found`);
    return;
  }

  // Validate user is a member of the room
  const membership = await roomMemberRepository.findByRoomAndUser(room.id, client.userId);
  if (!membership) {
    sendError(socket, 'NOT_ROOM_MEMBER', 'You are not a member of this room');
    return;
  }

  // Add socket to room
  let roomSockets = rooms.get(roomCode);
  if (!roomSockets) {
    roomSockets = new Set();
    rooms.set(roomCode, roomSockets);
  }
  roomSockets.add(socket);
  client.roomCode = roomCode;

  // Fetch all room members with user data
  const members = await roomMemberRepository.findByRoomId(room.id);
  const players = await Promise.all(
    members.map(async (member) => {
      const user = await userRepository.findById(member.userId);
      return {
        id: member.userId,
        name: user?.name ?? 'Unknown',
        image: user?.avatarUrl ?? null,
        isHost: member.userId === room.hostId,
      };
    }),
  );

  // Send room_joined to the joining client
  const joinedMessage: RoomJoinedMessage = {
    type: 'room_joined',
    timestamp: Date.now(),
    payload: {
      roomId: room.id,
      roomCode: room.code,
      players,
    },
  };
  sendToSocket(socket, joinedMessage);

  // Broadcast player_joined to other clients in the room
  const playerJoinedMessage: PlayerJoinedMessage = {
    type: 'player_joined',
    timestamp: Date.now(),
    payload: {
      player: {
        id: client.userId,
        name: client.userName,
        image: client.userImage,
        isHost: client.userId === room.hostId,
      },
    },
  };
  broadcastToRoom(roomCode, playerJoinedMessage, socket);

  // Check if room is now full
  const memberCount = await roomMemberRepository.countByRoomId(room.id);
  if (memberCount >= room.maxPlayers) {
    const roomReadyMessage: RoomReadyMessage = {
      type: 'room_ready',
      timestamp: Date.now(),
      payload: {
        roomId: room.id,
        roomCode: room.code,
        message: 'Room is full! Time to play!',
      },
    };
    broadcastToRoom(roomCode, roomReadyMessage);
  }
}

export async function handleLeaveRoom(
  socket: WebSocket,
  message: LeaveRoomMessage,
  _db: Database,
): Promise<void> {
  const { roomCode } = message.payload;
  const client = getClientData(socket);

  if (!client) {
    sendError(socket, 'INVALID_CLIENT', 'Client not initialized');
    return;
  }

  // Remove socket from room
  const roomSockets = rooms.get(roomCode);
  if (roomSockets) {
    roomSockets.delete(socket);

    if (roomSockets.size === 0) {
      rooms.delete(roomCode);
    } else {
      // Broadcast player_left to remaining clients
      const playerLeftMessage: PlayerLeftMessage = {
        type: 'player_left',
        timestamp: Date.now(),
        payload: {
          playerId: client.userId,
        },
      };
      broadcastToRoom(roomCode, playerLeftMessage);
    }
  }

  client.roomCode = null;
}

export function handleDisconnect(socket: WebSocket): void {
  const client = getClientData(socket);

  // Remove from lobby subscribers
  if (client?.isInLobby) {
    lobbySubscribers.delete(socket);
  }

  if (!client?.roomCode) return;

  const roomSockets = rooms.get(client.roomCode);
  if (roomSockets) {
    roomSockets.delete(socket);

    if (roomSockets.size === 0) {
      rooms.delete(client.roomCode);
    } else {
      // Broadcast player_left to remaining clients
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

// Lobby subscription handlers
export function handleSubscribeLobby(socket: WebSocket): void {
  const client = getClientData(socket);
  if (!client) {
    sendError(socket, 'INVALID_CLIENT', 'Client not initialized');
    return;
  }

  lobbySubscribers.add(socket);
  client.isInLobby = true;

  const message: LobbySubscribedMessage = {
    type: 'lobby_subscribed',
    timestamp: Date.now(),
    payload: {
      message: 'Subscribed to room list updates',
    },
  };
  sendToSocket(socket, message);
}

export function handleUnsubscribeLobby(socket: WebSocket): void {
  const client = getClientData(socket);
  if (!client) return;

  lobbySubscribers.delete(socket);
  client.isInLobby = false;
}

// Broadcast to all lobby subscribers
function broadcastToLobby(message: unknown): void {
  for (const socket of lobbySubscribers) {
    if (socket.readyState === socket.OPEN) {
      sendToSocket(socket, message);
    }
  }
}

// Called when a room is created (from HTTP controller)
export function broadcastRoomCreated(room: Room): void {
  const message: RoomCreatedMessage = {
    type: 'room_created',
    timestamp: Date.now(),
    payload: { room },
  };
  broadcastToLobby(message);
}

// Called when a room is deleted (from HTTP controller)
export function broadcastRoomDeleted(roomId: string, roomCode: string): void {
  const message: RoomDeletedMessage = {
    type: 'room_deleted',
    timestamp: Date.now(),
    payload: {
      roomId,
      roomCode,
    },
  };

  // Broadcast to lobby subscribers (users viewing room list)
  broadcastToLobby(message);

  // Also broadcast to room members (users inside the room)
  const roomSockets = rooms.get(roomCode);
  if (roomSockets) {
    for (const socket of roomSockets) {
      sendToSocket(socket, message);
    }
  }
}
