import { z } from 'zod'
import { roomSchema } from './index'

export const wsMessageTypeSchema = z.enum([
  'join_room',
  'leave_room',
  'room_joined',
  'room_left',
  'player_joined',
  'player_left',
  'viewer_left',
  'room_ready',
  'game_start',
  'game_end',
  'game_state',
  'player_action',
  'error',
  'ping',
  'pong',
  // Lobby events
  'subscribe_lobby',
  'unsubscribe_lobby',
  'lobby_subscribed',
  'room_created',
  'room_updated',
  'room_deleted',
])

export type WsMessageType = z.infer<typeof wsMessageTypeSchema>

export const baseWsMessageSchema = z.object({
  type: wsMessageTypeSchema,
  timestamp: z.number().default(() => Date.now()),
})

// Shared player schema for WS payloads
export const wsPlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  isHost: z.boolean(),
})

// Client only sends roomCode - userId comes from authenticated session
export const joinRoomMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('join_room'),
  payload: z.object({
    roomCode: z.string().length(6),
  }),
})

export const leaveRoomMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('leave_room'),
  payload: z.object({
    roomCode: z.string().length(6),
  }),
})

export const roomJoinedMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('room_joined'),
  payload: z.object({
    roomId: z.uuid(),
    roomCode: z.string().length(6),
    players: z.array(wsPlayerSchema),
  }),
})

export const playerJoinedMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('player_joined'),
  payload: z.object({
    player: wsPlayerSchema,
  }),
})

export const playerLeftMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('player_left'),
  payload: z.object({
    playerId: z.string(),
  }),
})

export const viewerLeftMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('viewer_left'),
  payload: z.object({
    playerId: z.string(),
    roomCode: z.string().length(6),
  }),
})

export const roomReadyMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('room_ready'),
  payload: z.object({
    roomId: z.uuid(),
    roomCode: z.string().length(6),
    message: z.string(),
  }),
})

export const errorMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('error'),
  payload: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

export const pingMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('ping'),
})

export const pongMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('pong'),
})

// Lobby subscription messages
export const subscribeLobbyMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('subscribe_lobby'),
})

export const unsubscribeLobbyMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('unsubscribe_lobby'),
})

export const lobbySubscribedMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('lobby_subscribed'),
  payload: z.object({
    message: z.string(),
  }),
})

export const roomCreatedMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('room_created'),
  payload: z.object({
    room: roomSchema,
  }),
})

export const roomUpdatedMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('room_updated'),
  payload: z.object({
    roomId: z.uuid(),
    roomCode: z.string().length(6),
    memberCount: z.number().int().min(0),
  }),
})

export const roomDeletedMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('room_deleted'),
  payload: z.object({
    roomId: z.uuid(),
    roomCode: z.string(),
  }),
})

export const wsIncomingMessageSchema = z.discriminatedUnion('type', [
  joinRoomMessageSchema,
  leaveRoomMessageSchema,
  pingMessageSchema,
  subscribeLobbyMessageSchema,
  unsubscribeLobbyMessageSchema,
])

// Payload-only schemas (for client-side validation of incoming WS events)
export const roomJoinedPayloadSchema = roomJoinedMessageSchema.shape.payload
export const playerJoinedPayloadSchema = playerJoinedMessageSchema.shape.payload
export const playerLeftPayloadSchema = playerLeftMessageSchema.shape.payload
export const viewerLeftPayloadSchema = viewerLeftMessageSchema.shape.payload
export const roomReadyPayloadSchema = roomReadyMessageSchema.shape.payload
export const errorPayloadSchema = errorMessageSchema.shape.payload
export const roomCreatedPayloadSchema = roomCreatedMessageSchema.shape.payload
export const roomUpdatedPayloadSchema = roomUpdatedMessageSchema.shape.payload
export const roomDeletedPayloadSchema = roomDeletedMessageSchema.shape.payload

// Inferred types
export type WsIncomingMessage = z.infer<typeof wsIncomingMessageSchema>
export type JoinRoomMessage = z.infer<typeof joinRoomMessageSchema>
export type LeaveRoomMessage = z.infer<typeof leaveRoomMessageSchema>
export type RoomJoinedMessage = z.infer<typeof roomJoinedMessageSchema>
export type PlayerJoinedMessage = z.infer<typeof playerJoinedMessageSchema>
export type PlayerLeftMessage = z.infer<typeof playerLeftMessageSchema>
export type ViewerLeftMessage = z.infer<typeof viewerLeftMessageSchema>
export type RoomReadyMessage = z.infer<typeof roomReadyMessageSchema>
export type ErrorMessage = z.infer<typeof errorMessageSchema>
export type PingMessage = z.infer<typeof pingMessageSchema>
export type PongMessage = z.infer<typeof pongMessageSchema>
export type SubscribeLobbyMessage = z.infer<typeof subscribeLobbyMessageSchema>
export type UnsubscribeLobbyMessage = z.infer<typeof unsubscribeLobbyMessageSchema>
export type LobbySubscribedMessage = z.infer<typeof lobbySubscribedMessageSchema>
export type RoomCreatedMessage = z.infer<typeof roomCreatedMessageSchema>
export type RoomUpdatedMessage = z.infer<typeof roomUpdatedMessageSchema>
export type RoomDeletedMessage = z.infer<typeof roomDeletedMessageSchema>
