import { describe, it, expect, beforeEach } from 'vitest';
import { GetUserUseCase } from './get-user.use-case';
import { createMockUser, createMockUserRepository } from '@test/mocks';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    useCase = new GetUserUseCase(mockUserRepository);
  });

  describe('execute', () => {
    it('should return user when found', async () => {
      const expectedUser = createMockUser({ id: 'user-123' });
      mockUserRepository.findById.mockResolvedValue(expectedUser);

      const result = await useCase.execute({ id: 'user-123' });

      expect(result.user).toEqual(expectedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
      expect(mockUserRepository.findById).toHaveBeenCalledOnce();
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({ id: 'non-existent' });

      expect(result.user).toBeNull();
      expect(mockUserRepository.findById).toHaveBeenCalledWith('non-existent');
    });
  });
});
