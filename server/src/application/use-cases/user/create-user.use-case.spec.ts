import { describe, it, expect, beforeEach } from 'vitest';
import { CreateUserUseCase } from './create-user.use-case';
import { createMockUser, createMockUserRepository } from '@test/mocks';
import { EmailAlreadyExistsError } from '@application/errors';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    useCase = new CreateUserUseCase(mockUserRepository);
  });

  describe('execute', () => {
    it('should create user successfully', async () => {
      const input = {
        email: 'newuser@example.com',
        name: 'New User',
        avatarUrl: 'https://example.com/avatar.png',
      };

      const expectedUser = createMockUser({
        email: input.email,
        name: input.name,
        avatarUrl: input.avatarUrl,
      });

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(expectedUser);

      const result = await useCase.execute(input);

      expect(result.user).toEqual(expectedUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledOnce();
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: input.email,
        name: input.name,
        avatarUrl: input.avatarUrl,
      });
      expect(mockUserRepository.create).toHaveBeenCalledOnce();
    });

    it('should throw EmailAlreadyExistsError if email already exists', async () => {
      const input = {
        email: 'existing@example.com',
        name: 'New User',
      };

      const existingUser = createMockUser({ email: input.email });
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(useCase.execute(input)).rejects.toThrow(
        EmailAlreadyExistsError,
      );
      await expect(useCase.execute(input)).rejects.toThrow(
        `User with email "${input.email}" already exists`,
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });
});
