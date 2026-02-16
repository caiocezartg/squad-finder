import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateUserUseCase } from './update-user.use-case'
import { createMockUser, createMockUserRepository } from '@test/mocks'

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase
  let mockUserRepository: ReturnType<typeof createMockUserRepository>

  beforeEach(() => {
    mockUserRepository = createMockUserRepository()
    useCase = new UpdateUserUseCase(mockUserRepository)
  })

  describe('execute', () => {
    it('should update user successfully', async () => {
      const input = {
        id: 'user-123',
        name: 'Updated Name',
        avatarUrl: 'https://example.com/new-avatar.png',
      }

      const expectedUser = createMockUser({
        id: input.id,
        name: input.name,
        avatarUrl: input.avatarUrl,
      })

      mockUserRepository.update.mockResolvedValue(expectedUser)

      const result = await useCase.execute(input)

      expect(result.user).toEqual(expectedUser)
      expect(mockUserRepository.update).toHaveBeenCalledWith(input.id, {
        name: input.name,
        avatarUrl: input.avatarUrl,
      })
      expect(mockUserRepository.update).toHaveBeenCalledOnce()
    })

    it('should return null if user not found', async () => {
      const input = {
        id: 'non-existent',
        name: 'Updated Name',
      }

      mockUserRepository.update.mockResolvedValue(null)

      const result = await useCase.execute(input)

      expect(result.user).toBeNull()
      expect(mockUserRepository.update).toHaveBeenCalledWith(input.id, {
        name: input.name,
      })
      expect(mockUserRepository.update).toHaveBeenCalledOnce()
    })

    it('should only update provided fields', async () => {
      const input = {
        id: 'user-123',
        name: 'Only Name Updated',
      }

      const expectedUser = createMockUser({
        id: input.id,
        name: input.name,
      })

      mockUserRepository.update.mockResolvedValue(expectedUser)

      const result = await useCase.execute(input)

      expect(result.user).toEqual(expectedUser)
      expect(mockUserRepository.update).toHaveBeenCalledWith(input.id, {
        name: input.name,
      })
      expect(mockUserRepository.update).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ avatarUrl: expect.anything() })
      )
    })
  })
})
