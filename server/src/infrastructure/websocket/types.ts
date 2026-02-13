import { z } from 'zod';
import { roomSchema } from '@squadfinder/schemas';

export const wsMessageTypeSchema = z.enum([
  'join_room',
  'leave_room',
  'room_joined',
  'room_left',
  'player_joined',
  'player_left',
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
  'room_deleted',
]);

export type WsMessageType = z.infer<typeof wsMessageTypeSchema>;

export const baseWsMessageSchema = z.object({
  type: wsMessageTypeSchema,
  timestamp: z.number().default(() => Date.now()),
});

// Client only sends roomCode - userId comes from authenticated session
export const joinRoomMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('join_room'),
  payload: z.object({
    roomCode: z.string().length(6),
  }),
});

export const leaveRoomMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('leave_room'),
  payload: z.object({
    roomCode: z.string().length(6),
  }),
});

export const roomJoinedMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('room_joined'),
  payload: z.object({
    roomId: z.string().uuid(),
    roomCode: z.string().length(6),
    players: z.array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        image: z.string().nullable(),
        isHost: z.boolean(),
      })
    ),
  }),
});

export const playerJoinedMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('player_joined'),
  payload: z.object({
    player: z.object({
      id: z.string().uuid(),
      name: z.string(),
      image: z.string().nullable(),
      isHost: z.boolean(),
    }),
  }),
});

export const playerLeftMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('player_left'),
  payload: z.object({
    playerId: z.string().uuid(),
  }),
});

export const roomReadyMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('room_ready'),
  payload: z.object({
    roomId: z.string().uuid(),
    roomCode: z.string().length(6),
    message: z.string(),
  }),
});

export const errorMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('error'),
  payload: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export const pingMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('ping'),
});

export const pongMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('pong'),
});

// Lobby subscription messages
export const subscribeLobbyMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('subscribe_lobby'),
});

export const unsubscribeLobbyMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('unsubscribe_lobby'),
});

export const lobbySubscribedMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('lobby_subscribed'),
  payload: z.object({
    message: z.string(),
  }),
});

export const roomCreatedMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('room_created'),
  payload: z.object({
    room: roomSchema,
  }),
});

export const roomDeletedMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('room_deleted'),
  payload: z.object({
    roomId: z.string().uuid(),
    roomCode: z.string(),
  }),
});

export const wsIncomingMessageSchema = z.discriminatedUnion('type', [
  joinRoomMessageSchema,
  leaveRoomMessageSchema,
  pingMessageSchema,
  subscribeLobbyMessageSchema,
  unsubscribeLobbyMessageSchema,
]);

export type WsIncomingMessage = z.infer<typeof wsIncomingMessageSchema>;

export type JoinRoomMessage = z.infer<typeof joinRoomMessageSchema>;
export type LeaveRoomMessage = z.infer<typeof leaveRoomMessageSchema>;
export type RoomJoinedMessage = z.infer<typeof roomJoinedMessageSchema>;
export type PlayerJoinedMessage = z.infer<typeof playerJoinedMessageSchema>;
export type PlayerLeftMessage = z.infer<typeof playerLeftMessageSchema>;
export type RoomReadyMessage = z.infer<typeof roomReadyMessageSchema>;
export type ErrorMessage = z.infer<typeof errorMessageSchema>;
export type PingMessage = z.infer<typeof pingMessageSchema>;
export type PongMessage = z.infer<typeof pongMessageSchema>;
export type SubscribeLobbyMessage = z.infer<typeof subscribeLobbyMessageSchema>;
export type UnsubscribeLobbyMessage = z.infer<typeof unsubscribeLobbyMessageSchema>;
export type LobbySubscribedMessage = z.infer<typeof lobbySubscribedMessageSchema>;
export type RoomCreatedMessage = z.infer<typeof roomCreatedMessageSchema>;
export type RoomDeletedMessage = z.infer<typeof roomDeletedMessageSchema>;

export interface WsClient {
  userId: string;
  userName: string;
  userImage: string | null;
  roomCode: string | null;
  isInLobby: boolean; // Subscribed to room list updates
  send: (message: unknown) => void;
}
