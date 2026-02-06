import { z } from 'zod';

export const gameResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  coverUrl: z.string().url(),
  minPlayers: z.number().int(),
  maxPlayers: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GameResponseDto = z.infer<typeof gameResponseSchema>;

export const gameIdParamSchema = z.object({
  id: z.string().uuid('Invalid game ID'),
});

export type GameIdParamDto = z.infer<typeof gameIdParamSchema>;
