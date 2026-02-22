export type RoomStatus = 'waiting' | 'playing' | 'finished'

export interface Room {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly hostId: string
  readonly gameId: string
  readonly status: RoomStatus
  readonly maxPlayers: number
  readonly discordLink: string | null
  readonly tags: string[]
  readonly language: 'en' | 'pt-br'
  readonly completedAt: Date | null
  readonly readyNotifiedAt: Date | null
  readonly memberCount?: number
  readonly isMember?: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface CreateRoomInput {
  readonly name: string
  readonly hostId: string
  readonly gameId: string
  readonly maxPlayers: number
  readonly discordLink: string
  readonly tags?: string[]
  readonly language?: 'en' | 'pt-br'
}

export interface UpdateRoomInput {
  readonly name?: string
  readonly status?: RoomStatus
  readonly maxPlayers?: number
  readonly discordLink?: string
  readonly tags?: string[]
  readonly language?: 'en' | 'pt-br'
  readonly completedAt?: Date
  readonly readyNotifiedAt?: Date
}
