import { z } from 'zod';

export const wsMessageTypeSchema = z.enum([
  'join_room',
  'leave_room',
  'room_joined',
  'room_left',
  'player_joined',
  'player_left',
  'game_start',
  'game_end',
  'game_state',
  'player_action',
  'error',
  'ping',
  'pong',
]);

export type WsMessageType = z.infer<typeof wsMessageTypeSchema>;

export const baseWsMessageSchema = z.object({
  type: wsMessageTypeSchema,
  timestamp: z.number().default(() => Date.now()),
});

export const joinRoomMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('join_room'),
  payload: z.object({
    roomCode: z.string().length(6),
    userId: z.string().uuid(),
  }),
});

export const leaveRoomMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('leave_room'),
  payload: z.object({
    roomCode: z.string().length(6),
    userId: z.string().uuid(),
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

export const wsIncomingMessageSchema = z.discriminatedUnion('type', [
  joinRoomMessageSchema,
  leaveRoomMessageSchema,
  pingMessageSchema,
]);

export type WsIncomingMessage = z.infer<typeof wsIncomingMessageSchema>;

export type JoinRoomMessage = z.infer<typeof joinRoomMessageSchema>;
export type LeaveRoomMessage = z.infer<typeof leaveRoomMessageSchema>;
export type RoomJoinedMessage = z.infer<typeof roomJoinedMessageSchema>;
export type PlayerJoinedMessage = z.infer<typeof playerJoinedMessageSchema>;
export type PlayerLeftMessage = z.infer<typeof playerLeftMessageSchema>;
export type ErrorMessage = z.infer<typeof errorMessageSchema>;
export type PingMessage = z.infer<typeof pingMessageSchema>;
export type PongMessage = z.infer<typeof pongMessageSchema>;

export interface WsClient {
  userId: string;
  roomCode: string | null;
  send: (message: unknown) => void;
}
