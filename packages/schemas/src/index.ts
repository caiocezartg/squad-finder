import { z } from 'zod'

// Room status schema
export const roomStatusSchema = z.enum(['waiting', 'playing', 'finished'])

// User schema
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  image: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserDto = z.infer<typeof userSchema>

// Game schema
export const gameSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  coverUrl: z.url(),
  minPlayers: z.number().int(),
  maxPlayers: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type GameDto = z.infer<typeof gameSchema>

// Room schema
export const roomSchema = z.object({
  id: z.uuid(),
  code: z.string(),
  name: z.string(),
  hostId: z.string(),
  gameId: z.uuid(),
  status: roomStatusSchema,
  maxPlayers: z.number().int(),
  discordLink: z.url().nullable(),
  memberCount: z.number().int().optional(),
  isMember: z.boolean().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type RoomDto = z.infer<typeof roomSchema>

// Room member schema
export const roomMemberSchema = z.object({
  id: z.uuid(),
  roomId: z.uuid(),
  userId: z.string(),
  joinedAt: z.coerce.date(),
})

export type RoomMemberDto = z.infer<typeof roomMemberSchema>

// Create room input schema
export const createRoomInputSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100, 'Room name too long'),
  gameId: z.uuid({ error: 'Invalid game ID' }),
  maxPlayers: z.number().int().min(2).max(20).optional(),
  discordLink: z
    .url({ error: 'Invalid Discord link' })
    .refine(
      (url) =>
        url.startsWith('https://discord.gg/') || url.startsWith('https://discord.com/invite/'),
      { message: 'Discord link must be a valid Discord invite URL' }
    ),
})

export type CreateRoomInput = z.infer<typeof createRoomInputSchema>
