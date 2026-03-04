import { describe, it, expect, beforeEach } from 'vitest'
import { GetRoomByCodeUseCase } from './get-room-by-code.use-case'
import {
  createMockRoom,
  createMockRoomRepository,
  createMockRoomMemberRepository,
  createMockUserRepository,
} from '@test/mocks'

describe('GetRoomByCodeUseCase', () => {
  let useCase: GetRoomByCodeUseCase
  let mockRoomRepository: ReturnType<typeof createMockRoomRepository>
  let mockRoomMemberRepository: ReturnType<typeof createMockRoomMemberRepository>
  let mockUserRepository: ReturnType<typeof createMockUserRepository>

  beforeEach(() => {
    mockRoomRepository = createMockRoomRepository()
    mockRoomMemberRepository = createMockRoomMemberRepository()
    mockUserRepository = createMockUserRepository()
    useCase = new GetRoomByCodeUseCase(
      mockRoomRepository,
      mockRoomMemberRepository,
      mockUserRepository
    )
  })

  describe('execute', () => {
    it('should return room and players when found', async () => {
      const expectedRoom = createMockRoom({ code: 'ABC123' })
      mockRoomRepository.findByCode.mockResolvedValue(expectedRoom)
      mockRoomMemberRepository.findByRoomId.mockResolvedValue([])
      mockUserRepository.findByIds.mockResolvedValue([])

      const result = await useCase.execute({ code: 'ABC123' })

      expect(result.room).toEqual(expectedRoom)
      expect(result.players).toEqual([])
      expect(mockRoomRepository.findByCode).toHaveBeenCalledWith('ABC123')
      expect(mockRoomRepository.findByCode).toHaveBeenCalledOnce()
    })

    it('should return null and empty players when not found', async () => {
      mockRoomRepository.findByCode.mockResolvedValue(null)

      const result = await useCase.execute({ code: 'NOTFND' })

      expect(result.room).toBeNull()
      expect(result.players).toEqual([])
      expect(mockRoomRepository.findByCode).toHaveBeenCalledWith('NOTFND')
    })
  })
})
