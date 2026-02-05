import { z } from "zod";
import { Game } from "../types/index.js";

export const gameSchema = z.nativeEnum(Game);

export const createRoomSchema = z.object({
  game: gameSchema,
  slots: z.number().int().min(2).max(10),
  discordInvite: z.string().optional(),
});

export const userSchema = z.object({
  id: z.string(),
  discordId: z.string(),
  username: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UserInput = z.infer<typeof userSchema>;
