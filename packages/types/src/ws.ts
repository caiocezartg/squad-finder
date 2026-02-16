import type { Room } from './index'

// Player in a room lobby
export type Player = {
  id: string
  name: string
  image: string | null
  isHost: boolean
}

// WebSocket Event Payloads
export type RoomCreatedPayload = {
  room: Room
}

export type RoomDeletedPayload = {
  roomId: string
  roomCode: string
}

export type RoomJoinedPayload = {
  roomId: string
  roomCode: string
  players: Player[]
}

export type PlayerJoinedPayload = {
  player: Player
}

export type PlayerLeftPayload = {
  playerId: string
}

export type RoomReadyPayload = {
  roomId: string
  roomCode: string
  message: string
}

export type WsErrorPayload = {
  code: string
  message: string
}
