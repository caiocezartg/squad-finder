import { describe, it, expect, beforeEach } from 'vitest';
import { JoinRoomUseCase } from './join-room.use-case';
import {
  RoomNotFoundError,
  RoomNotWaitingError,
  RoomFullError,
} from '@application/errors';
import {
  createMockRoom,
  createMockRoomRepository,
  createMockRoomMember,
  createMockRoomMemberRepository,
} from '@test/mocks';

describe('JoinRoomUseCase', () => {
  let useCase: JoinRoomUseCase;
  let mockRoomRepository: ReturnType<typeof createMockRoomRepository>;
  let mockRoomMemberRepository: ReturnType<typeof createMockRoomMemberRepository>;

  beforeEach(() => {
    mockRoomRepository = createMockRoomRepository();
    mockRoomMemberRepository = createMockRoomMemberRepository();
    useCase = new JoinRoomUseCase(mockRoomRepository, mockRoomMemberRepository);
  });

  describe('execute', () => {
    it('should join room successfully', async () => {
      const room = createMockRoom({ id: 'room-1', status: 'waiting', maxPlayers: 5 });
      const expectedMember = createMockRoomMember({
        roomId: 'room-1',
        userId: 'user-1',
      });

      mockRoomRepository.findById.mockResolvedValue(room);
      mockRoomMemberRepository.findByRoomAndUser.mockResolvedValue(null);
      mockRoomMemberRepository.countByRoomId.mockResolvedValue(2);
      mockRoomMemberRepository.create.mockResolvedValue(expectedMember);

      const result = await useCase.execute({
        roomId: 'room-1',
        userId: 'user-1',
      });

      expect(result.roomMember).toEqual(expectedMember);
      expect(mockRoomRepository.findById).toHaveBeenCalledWith('room-1');
      expect(mockRoomMemberRepository.findByRoomAndUser).toHaveBeenCalledWith('room-1', 'user-1');
      expect(mockRoomMemberRepository.countByRoomId).toHaveBeenCalledWith('room-1');
      expect(mockRoomMemberRepository.create).toHaveBeenCalledWith({
        roomId: 'room-1',
        userId: 'user-1',
      });
    });

    it('should throw RoomNotFoundError if room not found', async () => {
      mockRoomRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          roomId: 'non-existent-room',
          userId: 'user-1',
        }),
      ).rejects.toThrow(RoomNotFoundError);

      expect(mockRoomRepository.findById).toHaveBeenCalledWith('non-existent-room');
      expect(mockRoomMemberRepository.create).not.toHaveBeenCalled();
    });

    it('should throw RoomFullError if room is full', async () => {
      const room = createMockRoom({ id: 'room-1', status: 'waiting', maxPlayers: 5 });

      mockRoomRepository.findById.mockResolvedValue(room);
      mockRoomMemberRepository.findByRoomAndUser.mockResolvedValue(null);
      mockRoomMemberRepository.countByRoomId.mockResolvedValue(5);

      await expect(
        useCase.execute({
          roomId: 'room-1',
          userId: 'user-1',
        }),
      ).rejects.toThrow(RoomFullError);

      expect(mockRoomMemberRepository.create).not.toHaveBeenCalled();
    });

    it('should return existing member if user already in room (idempotent)', async () => {
      const room = createMockRoom({ id: 'room-1', status: 'waiting', maxPlayers: 5 });
      const existingMember = createMockRoomMember({
        roomId: 'room-1',
        userId: 'user-1',
      });

      mockRoomRepository.findById.mockResolvedValue(room);
      mockRoomMemberRepository.findByRoomAndUser.mockResolvedValue(existingMember);

      const result = await useCase.execute({
        roomId: 'room-1',
        userId: 'user-1',
      });

      expect(result.roomMember).toEqual(existingMember);
      expect(mockRoomMemberRepository.create).not.toHaveBeenCalled();
    });

    it('should set completedAt when last player joins', async () => {
      const room = createMockRoom({ id: 'room-1', status: 'waiting', maxPlayers: 3 });
      const expectedMember = createMockRoomMember({
        roomId: 'room-1',
        userId: 'user-3',
      });

      mockRoomRepository.findById.mockResolvedValue(room);
      mockRoomMemberRepository.findByRoomAndUser.mockResolvedValue(null);
      // First call (before create): 2 members, room not full yet
      // Second call (after create): 3 members, room is now full
      mockRoomMemberRepository.countByRoomId
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(3);
      mockRoomMemberRepository.create.mockResolvedValue(expectedMember);
      mockRoomRepository.update.mockResolvedValue(
        createMockRoom({ ...room, completedAt: new Date() }),
      );

      const result = await useCase.execute({
        roomId: 'room-1',
        userId: 'user-3',
      });

      expect(result.roomMember).toEqual(expectedMember);
      expect(mockRoomRepository.update).toHaveBeenCalledWith('room-1', {
        completedAt: expect.any(Date),
      });
    });

    it('should not set completedAt when room is not full after join', async () => {
      const room = createMockRoom({ id: 'room-1', status: 'waiting', maxPlayers: 5 });
      const expectedMember = createMockRoomMember({
        roomId: 'room-1',
        userId: 'user-2',
      });

      mockRoomRepository.findById.mockResolvedValue(room);
      mockRoomMemberRepository.findByRoomAndUser.mockResolvedValue(null);
      mockRoomMemberRepository.countByRoomId
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2);
      mockRoomMemberRepository.create.mockResolvedValue(expectedMember);

      await useCase.execute({
        roomId: 'room-1',
        userId: 'user-2',
      });

      expect(mockRoomRepository.update).not.toHaveBeenCalled();
    });

    it('should throw RoomNotWaitingError if room status is not waiting', async () => {
      const room = createMockRoom({ id: 'room-1', status: 'playing', maxPlayers: 5 });

      mockRoomRepository.findById.mockResolvedValue(room);

      await expect(
        useCase.execute({
          roomId: 'room-1',
          userId: 'user-1',
        }),
      ).rejects.toThrow(RoomNotWaitingError);

      expect(mockRoomMemberRepository.findByRoomAndUser).not.toHaveBeenCalled();
      expect(mockRoomMemberRepository.create).not.toHaveBeenCalled();
    });
  });
});
