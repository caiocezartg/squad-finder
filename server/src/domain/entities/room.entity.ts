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
  readonly completedAt: Date | null
  readonly memberCount?: number
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface CreateRoomInput {
  readonly name: string
  readonly hostId: string
  readonly gameId: string
  readonly maxPlayers?: number
  readonly discordLink: string
}

export interface UpdateRoomInput {
  readonly name?: string
  readonly status?: RoomStatus
  readonly maxPlayers?: number
  readonly discordLink?: string
  readonly completedAt?: Date
}
