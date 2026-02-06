// Room status enum
export type RoomStatus = 'waiting' | 'playing' | 'finished';

// User entity (matches Better Auth user table)
export type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Game entity
export type Game = {
  id: string;
  name: string;
  slug: string;
  coverUrl: string;
  minPlayers: number;
  maxPlayers: number;
  createdAt: Date;
  updatedAt: Date;
};

// Room entity
export type Room = {
  id: string;
  code: string;
  name: string;
  hostId: string;
  gameId: string;
  status: RoomStatus;
  maxPlayers: number;
  createdAt: Date;
  updatedAt: Date;
};

// RoomMember entity
export type RoomMember = {
  id: string;
  roomId: string;
  userId: string;
  joinedAt: Date;
};
