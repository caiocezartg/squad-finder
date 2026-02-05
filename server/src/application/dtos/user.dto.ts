import { z } from 'zod';

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserResponseDto = z.infer<typeof userResponseSchema>;

export const createUserRequestSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
});

export type CreateUserRequestDto = z.infer<typeof createUserRequestSchema>;

export const updateUserRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export type UpdateUserRequestDto = z.infer<typeof updateUserRequestSchema>;

export const getUserParamsSchema = z.object({
  id: z.string().uuid(),
});

export type GetUserParamsDto = z.infer<typeof getUserParamsSchema>;
