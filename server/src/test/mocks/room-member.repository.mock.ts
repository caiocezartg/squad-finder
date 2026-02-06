import { vi, type Mock } from 'vitest';
import type { RoomMember, CreateRoomMemberInput } from '@domain/entities/room-member.entity';
import type { IRoomMemberRepository } from '@domain/repositories/room-member.repository';

export function createMockRoomMember(overrides?: Partial<RoomMember>): RoomMember {
  return {
    id: 'room-member-uuid-1',
    roomId: 'room-uuid-1',
    userId: 'user-uuid-1',
    joinedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export type MockRoomMemberRepository = {
  [K in keyof IRoomMemberRepository]: Mock<IRoomMemberRepository[K]>;
};

export function createMockRoomMemberRepository(): MockRoomMemberRepository {
  return {
    findByRoomId: vi.fn<(roomId: string) => Promise<RoomMember[]>>().mockResolvedValue([]),
    findByUserId: vi.fn<(userId: string) => Promise<RoomMember[]>>().mockResolvedValue([]),
    findByRoomAndUser: vi.fn<(roomId: string, userId: string) => Promise<RoomMember | null>>().mockResolvedValue(null),
    create: vi.fn<(input: CreateRoomMemberInput) => Promise<RoomMember>>().mockImplementation((input) =>
      Promise.resolve(
        createMockRoomMember({
          roomId: input.roomId,
          userId: input.userId,
        }),
      ),
    ),
    delete: vi.fn<(roomId: string, userId: string) => Promise<boolean>>().mockResolvedValue(false),
    deleteByRoomId: vi.fn<(roomId: string) => Promise<boolean>>().mockResolvedValue(false),
    countByRoomId: vi.fn<(roomId: string) => Promise<number>>().mockResolvedValue(0),
  };
}
