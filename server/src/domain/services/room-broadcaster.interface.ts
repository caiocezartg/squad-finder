import type { Room } from '@domain/entities/room.entity'

export interface IRoomBroadcaster {
  broadcastRoomCreated(room: Room): void
  broadcastRoomUpdated(roomId: string, roomCode: string, memberCount: number): void
  broadcastRoomDeleted(roomId: string, roomCode: string): void
}
