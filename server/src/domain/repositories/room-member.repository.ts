import type { CreateRoomMemberInput, RoomMember } from '@domain/entities/room-member.entity';

export interface IRoomMemberRepository {
  findByRoomId(roomId: string): Promise<RoomMember[]>;
  findByUserId(userId: string): Promise<RoomMember[]>;
  findByRoomAndUser(roomId: string, userId: string): Promise<RoomMember | null>;
  create(input: CreateRoomMemberInput): Promise<RoomMember>;
  delete(roomId: string, userId: string): Promise<boolean>;
  deleteByRoomId(roomId: string): Promise<boolean>;
  countByRoomId(roomId: string): Promise<number>;
}
