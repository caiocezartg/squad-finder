import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetMyRoomsUseCase } from './get-my-rooms.use-case'
import type { IRoomRepository } from '@domain/repositories/room.repository'

describe('GetMyRoomsUseCase', () => {
  let mockRoomRepo: { findMyRooms: ReturnType<typeof vi.fn> }
  let useCase: GetMyRoomsUseCase

  beforeEach(() => {
    mockRoomRepo = { findMyRooms: vi.fn() }
    useCase = new GetMyRoomsUseCase(mockRoomRepo as unknown as IRoomRepository)
  })

  it('should return hosted and joined rooms for a user', async () => {
    // Arrange
    const mockResult = {
      hosted: [{ id: '1', name: 'My Room', memberCount: 2, isMember: true }],
      joined: [{ id: '2', name: 'Other Room', memberCount: 3, isMember: true }],
    }
    mockRoomRepo.findMyRooms.mockResolvedValue(mockResult)

    // Act
    const result = await useCase.execute({ userId: 'user-1' })

    // Assert
    expect(result).toEqual(mockResult)
    expect(mockRoomRepo.findMyRooms).toHaveBeenCalledWith('user-1')
  })

  it('should return empty arrays when user has no rooms', async () => {
    // Arrange
    mockRoomRepo.findMyRooms.mockResolvedValue({ hosted: [], joined: [] })

    // Act
    const result = await useCase.execute({ userId: 'user-1' })

    // Assert
    expect(result.hosted).toHaveLength(0)
    expect(result.joined).toHaveLength(0)
    expect(mockRoomRepo.findMyRooms).toHaveBeenCalledWith('user-1')
  })
})
