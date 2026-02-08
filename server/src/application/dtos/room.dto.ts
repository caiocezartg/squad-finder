import { z } from 'zod';

// Re-export shared schema for room creation
export { createRoomInputSchema as createRoomRequestSchema } from '@squadfinder/schemas';
export type { CreateRoomInput as CreateRoomRequestDto } from '@squadfinder/schemas';

// Server-specific: URL param validation with uppercase transform
export const roomCodeParamSchema = z.object({
  code: z
    .string()
    .min(1)
    .max(6)
    .transform((val) => val.toUpperCase()),
});

export type RoomCodeParamDto = z.infer<typeof roomCodeParamSchema>;
