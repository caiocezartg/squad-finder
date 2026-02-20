import type { Room, Game, UserNotification } from './index'

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

export type NotificationsResponse = {
  notifications: UserNotification[]
}

export type MyRoomsResponse = {
  hosted: Room[]
  joined: Room[]
}
