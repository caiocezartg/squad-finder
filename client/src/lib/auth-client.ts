import { createAuthClient } from 'better-auth/react'
import { env } from '@/env'

const authClient = createAuthClient({
  baseURL: env.VITE_API_URL,
})

export const { signIn, signOut, useSession } = authClient
