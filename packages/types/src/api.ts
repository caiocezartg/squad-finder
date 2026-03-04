import type { Room, Game, UserNotification } from './index'
import type { Player } from './ws'

// API Response Types
export type RoomsResponse = {
  rooms: Room[]
}

export type RoomResponse = {
  room: Room
  players: Player[]
}

export type GamesResponse = {
  games: Game[]
}

export type GameResponse = {
  game: Game
}

export type CreateRoomResponse = {
  room: Room
}

export type NotificationsResponse = {
  notifications: UserNotification[]
}

export type MyRoomsResponse = {
  hosted: Room[]
  joined: Room[]
}
