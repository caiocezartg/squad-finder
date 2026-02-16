import { vi, type Mock } from 'vitest'
import type { Room, CreateRoomInput, UpdateRoomInput } from '@domain/entities/room.entity'
import type { IRoomRepository } from '@domain/repositories/room.repository'

export function createMockRoom(overrides?: Partial<Room>): Room {
  return {
    id: 'room-uuid-1',
    code: 'ABC123',
    name: 'Test Room',
    hostId: 'user-uuid-1',
    gameId: 'game-uuid-1',
    status: 'waiting',
    maxPlayers: 5,
    discordLink: null,
    completedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }
}

export type MockRoomRepository = {
  [K in keyof IRoomRepository]: Mock<IRoomRepository[K]>
}

export function createMockRoomRepository(): MockRoomRepository {
  return {
    findById: vi.fn<(id: string) => Promise<Room | null>>().mockResolvedValue(null),
    findByCode: vi.fn<(code: string) => Promise<Room | null>>().mockResolvedValue(null),
    findByHostId: vi.fn<(hostId: string) => Promise<Room[]>>().mockResolvedValue([]),
    findAll: vi.fn<() => Promise<Room[]>>().mockResolvedValue([]),
    findAvailable: vi.fn<() => Promise<Room[]>>().mockResolvedValue([]),
    create: vi.fn<(input: CreateRoomInput) => Promise<Room>>().mockImplementation((input) =>
      Promise.resolve(
        createMockRoom({
          name: input.name,
          hostId: input.hostId,
          gameId: input.gameId,
          maxPlayers: input.maxPlayers ?? 5,
          discordLink: input.discordLink ?? null,
        })
      )
    ),
    findExpiredRooms: vi.fn<(beforeDate: Date) => Promise<Room[]>>().mockResolvedValue([]),
    update: vi
      .fn<(id: string, input: UpdateRoomInput) => Promise<Room | null>>()
      .mockResolvedValue(null),
    delete: vi.fn<(id: string) => Promise<boolean>>().mockResolvedValue(false),
  }
}
