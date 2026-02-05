export enum Game {
  LOL = "LOL",
  DOTA = "DOTA",
  CS = "CS",
  VALORANT = "VALORANT",
}

export type User = {
  id: string;
  discordId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type Room = {
  id: string;
  game: Game;
  slots: number;
  hostId: string;
  discordInvite: string | null;
  createdAt: Date;
};

export type RoomMember = {
  userId: string;
  roomId: string;
  joinedAt: Date;
};
