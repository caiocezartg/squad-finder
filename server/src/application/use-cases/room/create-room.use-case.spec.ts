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
    it('should create room successfully', async () => {
      const expectedRoom = createMockRoom({
        name: 'My Room',
        hostId: 'host-123',
        maxPlayers: 5,
        isPrivate: true,
      });
      mockRoomRepository.create.mockResolvedValue(expectedRoom);

      const result = await useCase.execute({
        name: 'My Room',
        hostId: 'host-123',
        maxPlayers: 5,
        isPrivate: true,
      });

      expect(result.room.name).toBe('My Room');
      expect(result.room.hostId).toBe('host-123');
      expect(result.room.maxPlayers).toBe(5);
      expect(result.room.isPrivate).toBe(true);
      expect(mockRoomRepository.create).toHaveBeenCalledWith({
        name: 'My Room',
        hostId: 'host-123',
        maxPlayers: 5,
        isPrivate: true,
      });
      expect(mockRoomRepository.create).toHaveBeenCalledOnce();
    });

    it('should generate valid 6-char alphanumeric code', async () => {
      const expectedRoom = createMockRoom();
      mockRoomRepository.create.mockResolvedValue(expectedRoom);

      const result = await useCase.execute({
        name: 'Test Room',
        hostId: 'host-123',
      });

      expect(result.room.code).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should use default maxPlayers (10) when not provided', async () => {
      const expectedRoom = createMockRoom({ maxPlayers: 10 });
      mockRoomRepository.create.mockResolvedValue(expectedRoom);

      await useCase.execute({
        name: 'Test Room',
        hostId: 'host-123',
      });

      expect(mockRoomRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          maxPlayers: 10,
        }),
      );
    });

    it('should use default isPrivate (false) when not provided', async () => {
      const expectedRoom = createMockRoom({ isPrivate: false });
      mockRoomRepository.create.mockResolvedValue(expectedRoom);

      await useCase.execute({
        name: 'Test Room',
        hostId: 'host-123',
      });

      expect(mockRoomRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isPrivate: false,
        }),
      );
    });
  });
});
