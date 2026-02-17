import { env } from '@/env'

export interface ApiError {
  message: string
  code?: string
  status: number
}

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

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const error = errorBody as { message?: string; code?: string }
    throw new ApiClientError(error.message ?? response.statusText, response.status, error.code)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

function buildUrl(path: string): string {
  const baseUrl = env.VITE_API_URL
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...restOptions } = options

  const config: RequestInit = {
    ...restOptions,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    credentials: 'include',
  }

  if (body !== undefined) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(buildUrl(path), config)
  return handleResponse<T>(response)
}

export const api = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return apiClient<T>(path, { ...options, method: 'GET' })
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return apiClient<T>(path, { ...options, method: 'POST', body })
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return apiClient<T>(path, { ...options, method: 'PUT', body })
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return apiClient<T>(path, { ...options, method: 'PATCH', body })
  },

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return apiClient<T>(path, { ...options, method: 'DELETE' })
  },
}
