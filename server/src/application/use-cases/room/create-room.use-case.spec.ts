import { describe, it, expect, beforeEach } from 'vitest';
import { CreateRoomUseCase } from './create-room.use-case';
import { createMockRoom, createMockRoomRepository } from '@test/mocks';

describe('CreateRoomUseCase', () => {
  let useCase: CreateRoomUseCase;
  let mockRoomRepository: ReturnType<typeof createMockRoomRepository>;

  beforeEach(() => {
    mockRoomRepository = createMockRoomRepository();
    useCase = new CreateRoomUseCase(mockRoomRepository);
  });

  describe('execute', () => {
    it('should create room successfully with all fields', async () => {
      const expectedRoom = createMockRoom({
        name: 'My Room',
        hostId: 'host-123',
        gameId: 'game-123',
        maxPlayers: 5,
      });
      mockRoomRepository.create.mockResolvedValue(expectedRoom);

      const result = await useCase.execute({
        name: 'My Room',
        hostId: 'host-123',
        gameId: 'game-123',
        maxPlayers: 5,
        discordLink: 'https://discord.gg/test',
      });

      expect(result.room.name).toBe('My Room');
      expect(result.room.hostId).toBe('host-123');
      expect(result.room.gameId).toBe('game-123');
      expect(result.room.maxPlayers).toBe(5);
      expect(mockRoomRepository.create).toHaveBeenCalledWith({
        name: 'My Room',
        hostId: 'host-123',
        gameId: 'game-123',
        maxPlayers: 5,
        discordLink: 'https://discord.gg/test',
      });
      expect(mockRoomRepository.create).toHaveBeenCalledOnce();
    });

    it('should return room with valid 6-char alphanumeric code from repository', async () => {
      const expectedRoom = createMockRoom({ code: 'ABC123' });
      mockRoomRepository.create.mockResolvedValue(expectedRoom);

      const result = await useCase.execute({
        name: 'Test Room',
        hostId: 'host-123',
        gameId: 'game-123',
        discordLink: 'https://discord.gg/test',
      });

      expect(result.room.code).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should pass optional maxPlayers as undefined when not provided', async () => {
      const expectedRoom = createMockRoom({ maxPlayers: 5 });
      mockRoomRepository.create.mockResolvedValue(expectedRoom);

      await useCase.execute({
        name: 'Test Room',
        hostId: 'host-123',
        gameId: 'game-123',
        discordLink: 'https://discord.gg/test',
      });

      // Use case passes values as-is, repository handles defaults
      expect(mockRoomRepository.create).toHaveBeenCalledWith({
        name: 'Test Room',
        hostId: 'host-123',
        gameId: 'game-123',
        maxPlayers: undefined,
        discordLink: 'https://discord.gg/test',
      });
    });

    it('should pass custom maxPlayers to repository', async () => {
      const expectedRoom = createMockRoom({ maxPlayers: 10 });
      mockRoomRepository.create.mockResolvedValue(expectedRoom);

      await useCase.execute({
        name: 'Test Room',
        hostId: 'host-123',
        gameId: 'game-123',
        maxPlayers: 10,
        discordLink: 'https://discord.gg/test',
      });

      expect(mockRoomRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          maxPlayers: 10,
          discordLink: 'https://discord.gg/test',
        }),
      );
    });
  });
});
