import { z } from 'zod';

// Request DTOs
export const createRoomRequestSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100, 'Room name too long'),
  gameId: z.string().uuid('Invalid game ID'),
  maxPlayers: z.number().int().min(2).max(20).optional(),
});

export type CreateRoomRequestDto = z.infer<typeof createRoomRequestSchema>;

export const roomCodeParamSchema = z.object({
  code: z
    .string()
    .min(1)
    .max(6)
    .transform((val) => val.toUpperCase()),
});

export type RoomCodeParamDto = z.infer<typeof roomCodeParamSchema>;

// Response DTOs
export const roomResponseSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  hostId: z.string().uuid(),
  gameId: z.string().uuid(),
  status: z.enum(['waiting', 'playing', 'finished']),
  maxPlayers: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RoomResponseDto = z.infer<typeof roomResponseSchema>;

export const roomMemberResponseSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  userId: z.string().uuid(),
  joinedAt: z.date(),
});

export type RoomMemberResponseDto = z.infer<typeof roomMemberResponseSchema>;
