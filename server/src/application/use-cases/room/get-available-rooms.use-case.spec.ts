import { describe, it, expect, beforeEach } from 'vitest';
import { GetAvailableRoomsUseCase } from './get-available-rooms.use-case';
import { createMockRoom, createMockRoomRepository } from '@test/mocks';

describe('GetAvailableRoomsUseCase', () => {
  let useCase: GetAvailableRoomsUseCase;
  let mockRoomRepository: ReturnType<typeof createMockRoomRepository>;

  beforeEach(() => {
    mockRoomRepository = createMockRoomRepository();
    useCase = new GetAvailableRoomsUseCase(mockRoomRepository);
  });

  describe('execute', () => {
    it('should return available rooms', async () => {
      const expectedRooms = [
        createMockRoom({ id: 'room-1', name: 'Room One' }),
        createMockRoom({ id: 'room-2', name: 'Room Two' }),
      ];
      mockRoomRepository.findAvailable.mockResolvedValue(expectedRooms);

      const result = await useCase.execute();

      expect(result.rooms).toEqual(expectedRooms);
      expect(mockRoomRepository.findAvailable).toHaveBeenCalledOnce();
    });

    it('should return empty array when no rooms available', async () => {
      mockRoomRepository.findAvailable.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result.rooms).toEqual([]);
      expect(mockRoomRepository.findAvailable).toHaveBeenCalledOnce();
    });
  });
});
