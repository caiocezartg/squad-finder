import { z } from 'zod'

export function parseWsPayload<T>(schema: z.ZodType<T>, raw: unknown): T | null {
  const result = schema.safeParse(raw)
  if (!result.success) {
    console.error('Invalid WebSocket payload:', z.treeifyError(result.error))
    return null
  }
  return result.data
}
