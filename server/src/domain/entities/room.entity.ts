export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface Room {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly hostId: string;
  readonly status: RoomStatus;
  readonly maxPlayers: number;
  readonly isPrivate: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateRoomInput {
  readonly name: string;
  readonly hostId: string;
  readonly maxPlayers?: number;
  readonly isPrivate?: boolean;
}

export interface UpdateRoomInput {
  readonly name?: string;
  readonly status?: RoomStatus;
  readonly maxPlayers?: number;
  readonly isPrivate?: boolean;
}
