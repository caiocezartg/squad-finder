import type { WebSocket } from '@fastify/websocket'
import type { IRoomRepository } from '@domain/repositories/room.repository'
import type { IRoomMemberRepository } from '@domain/repositories/room-member.repository'
import type { IUserRepository } from '@domain/repositories/user.repository'
import type {
  JoinRoomMessage,
  LeaveRoomMessage,
  WsClient,
  RoomJoinedMessage,
  PlayerJoinedMessage,
  PlayerLeftMessage,
  ViewerLeftMessage,
  RoomReadyMessage,
  ErrorMessage,
  LobbySubscribedMessage,
} from '../types'
import type { WsConnectionManager } from '../ws-connection-manager'

function sendToSocket(socket: WebSocket, message: unknown): void {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(message))
  }
}

export function sendError(socket: WebSocket, code: string, message: string): void {
  const errorMessage: ErrorMessage = {
    type: 'error',
    timestamp: Date.now(),
    payload: { code, message },
  }
  sendToSocket(socket, errorMessage)
}

export async function handleJoinRoom(
  socket: WebSocket,
  message: JoinRoomMessage,
  connectionManager: WsConnectionManager,
  roomRepository: IRoomRepository,
  roomMemberRepository: IRoomMemberRepository,
  userRepository: IUserRepository
): Promise<void> {
  const { roomCode } = message.payload
  const client = connectionManager.getClientData(socket)

  if (!client) {
    sendError(socket, 'INVALID_CLIENT', 'Client not initialized')
    return
  }

  if (!client.userId) {
    sendError(socket, 'UNAUTHORIZED', 'Authentication required')
    return
  }

  // Validate room exists
  const room = await roomRepository.findByCode(roomCode)
  if (!room) {
    sendError(socket, 'ROOM_NOT_FOUND', `Room "${roomCode}" not found`)
    return
  }

  // Validate user is a member of the room
  const membership = await roomMemberRepository.findByRoomAndUser(room.id, client.userId)
  if (!membership) {
    sendError(socket, 'NOT_ROOM_MEMBER', 'You are not a member of this room')
    return
  }

  // Add socket to room
  connectionManager.addToRoom(roomCode, socket)
  client.roomCode = roomCode

  // Fetch all room members with user data (single query)
  const members = await roomMemberRepository.findByRoomId(room.id)
  const userIds = members.map((m) => m.userId)
  const users = await userRepository.findByIds(userIds)
  const usersById = new Map(users.map((u) => [u.id, u]))
  const players = members.map((member) => {
    const u = usersById.get(member.userId)
    return {
      id: member.userId,
      name: u?.name ?? 'Unknown',
      image: u?.avatarUrl ?? null,
      isHost: member.userId === room.hostId,
    }
  })

  // Send room_joined to the joining client
  const joinedMessage: RoomJoinedMessage = {
    type: 'room_joined',
    timestamp: Date.now(),
    payload: { roomId: room.id, roomCode: room.code, players },
  }
  sendToSocket(socket, joinedMessage)

  // Broadcast player_joined to other clients in the room
  const playerJoinedMessage: PlayerJoinedMessage = {
    type: 'player_joined',
    timestamp: Date.now(),
    payload: {
      player: {
        id: client.userId,
        name: client.userName ?? 'Unknown',
        image: client.userImage,
        isHost: client.userId === room.hostId,
      },
    },
  }
  connectionManager.broadcastToRoom(roomCode, playerJoinedMessage, socket)

  // Check if room is now full
  const memberCount = await roomMemberRepository.countByRoomId(room.id)
  if (memberCount >= room.maxPlayers) {
    const roomReadyMessage: RoomReadyMessage = {
      type: 'room_ready',
      timestamp: Date.now(),
      payload: {
        roomId: room.id,
        roomCode: room.code,
        message: 'Room is full! Time to play!',
      },
    }
    connectionManager.broadcastToRoom(roomCode, roomReadyMessage)
  }
}

export async function handleLeaveRoom(
  socket: WebSocket,
  message: LeaveRoomMessage,
  connectionManager: WsConnectionManager
): Promise<void> {
  const { roomCode } = message.payload
  const client = connectionManager.getClientData(socket)

  if (!client) {
    sendError(socket, 'INVALID_CLIENT', 'Client not initialized')
    return
  }

  if (!client.userId) {
    sendError(socket, 'UNAUTHORIZED', 'Authentication required')
    return
  }

  const hadSockets = connectionManager.removeFromRoom(roomCode, socket)

  if (hadSockets) {
    const roomSockets = connectionManager.getRoomSockets(roomCode)
    if (roomSockets && roomSockets.size > 0) {
      // Broadcast player_left to remaining clients
      const playerLeftMessage: PlayerLeftMessage = {
        type: 'player_left',
        timestamp: Date.now(),
        payload: { playerId: client.userId },
      }
      connectionManager.broadcastToRoom(roomCode, playerLeftMessage)
    }
  }

  client.roomCode = null
}

export function handleDisconnect(socket: WebSocket, connectionManager: WsConnectionManager): void {
  const client = connectionManager.getClientData(socket)

  // Remove from lobby subscribers
  if (client?.isInLobby) {
    connectionManager.unsubscribeLobby(socket)
  }

  if (!client?.roomCode) return
  if (!client.userId) return

  const roomCode = client.roomCode
  connectionManager.removeFromRoom(roomCode, socket)

  const roomSockets = connectionManager.getRoomSockets(roomCode)
  if (roomSockets && roomSockets.size > 0) {
    const viewerLeftMessage: ViewerLeftMessage = {
      type: 'viewer_left',
      timestamp: Date.now(),
      payload: { playerId: client.userId, roomCode },
    }
    connectionManager.broadcastToRoom(roomCode, viewerLeftMessage)
  }
}

// Lobby subscription handlers
export function handleSubscribeLobby(
  socket: WebSocket,
  connectionManager: WsConnectionManager
): void {
  const client = connectionManager.getClientData(socket)
  if (!client) {
    sendError(socket, 'INVALID_CLIENT', 'Client not initialized')
    return
  }

  connectionManager.subscribeLobby(socket)
  client.isInLobby = true

  const message: LobbySubscribedMessage = {
    type: 'lobby_subscribed',
    timestamp: Date.now(),
    payload: { message: 'Subscribed to room list updates' },
  }
  sendToSocket(socket, message)
}

export function handleUnsubscribeLobby(
  socket: WebSocket,
  connectionManager: WsConnectionManager
): void {
  const client = connectionManager.getClientData(socket)
  if (!client) return

  connectionManager.unsubscribeLobby(socket)
  client.isInLobby = false
}

// Keep setClientData as a convenience wrapper
export function setClientData(
  socket: WebSocket,
  data: WsClient,
  connectionManager: WsConnectionManager
): void {
  connectionManager.setClientData(socket, data)
}
