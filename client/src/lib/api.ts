import axios from 'axios'
import { env } from '@/env'

export class ApiClientError extends Error {
  public readonly status: number
  public readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
  }
}

const client = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const body = error.response.data as { message?: string; error?: string }
      throw new ApiClientError(
        body.message ?? error.response.statusText,
        error.response.status,
        body.error
      )
    }
    throw error
  }
)

export const api = {
  async get<T>(path: string): Promise<T> {
    const { data } = await client.get<T>(path)
    return data
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const { data } = await client.post<T>(path, body)
    return data
  },

  async put<T>(path: string, body?: unknown): Promise<T> {
    const { data } = await client.put<T>(path, body)
    return data
  },

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const { data } = await client.patch<T>(path, body)
    return data
  },

  async delete<T>(path: string): Promise<T> {
    const { data } = await client.delete<T>(path)
    return data
  },
}
