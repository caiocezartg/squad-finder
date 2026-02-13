import type { Room, Game } from './index'

// API Response Types
export type RoomsResponse = {
  rooms: Room[]
}

export type RoomResponse = {
  room: Room
}

export type GamesResponse = {
  games: Game[]
}

export type CreateRoomResponse = {
  room: Room
}
