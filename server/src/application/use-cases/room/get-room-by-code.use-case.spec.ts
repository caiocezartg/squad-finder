import { describe, it, expect, beforeEach } from 'vitest';
import { GetRoomByCodeUseCase } from './get-room-by-code.use-case';
import { createMockRoom, createMockRoomRepository } from '@test/mocks';

describe('GetRoomByCodeUseCase', () => {
  let useCase: GetRoomByCodeUseCase;
  let mockRoomRepository: ReturnType<typeof createMockRoomRepository>;

  beforeEach(() => {
    mockRoomRepository = createMockRoomRepository();
    useCase = new GetRoomByCodeUseCase(mockRoomRepository);
  });

  describe('execute', () => {
    it('should return room when found', async () => {
      const expectedRoom = createMockRoom({ code: 'ABC123' });
      mockRoomRepository.findByCode.mockResolvedValue(expectedRoom);

      const result = await useCase.execute({ code: 'ABC123' });

      expect(result.room).toEqual(expectedRoom);
      expect(mockRoomRepository.findByCode).toHaveBeenCalledWith('ABC123');
      expect(mockRoomRepository.findByCode).toHaveBeenCalledOnce();
    });

    it('should return null when not found', async () => {
      mockRoomRepository.findByCode.mockResolvedValue(null);

      const result = await useCase.execute({ code: 'NOTFND' });

      expect(result.room).toBeNull();
      expect(mockRoomRepository.findByCode).toHaveBeenCalledWith('NOTFND');
    });
  });
});
