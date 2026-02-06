import type { RoomMember } from '@domain/entities/room-member.entity';
import type { IRoomRepository } from '@domain/repositories/room.repository';
import type { IRoomMemberRepository } from '@domain/repositories/room-member.repository';

export interface JoinRoomInput {
  readonly roomId: string;
  readonly userId: string;
}

export interface JoinRoomOutput {
  readonly roomMember: RoomMember;
}

export interface IJoinRoomUseCase {
  execute(input: JoinRoomInput): Promise<JoinRoomOutput>;
}

export class RoomNotFoundError extends Error {
  constructor(roomId: string) {
    super(`Room with id "${roomId}" not found`);
    this.name = 'RoomNotFoundError';
  }
}

export class RoomNotWaitingError extends Error {
  constructor(roomId: string, status: string) {
    super(`Room "${roomId}" is not accepting players (status: ${status})`);
    this.name = 'RoomNotWaitingError';
  }
}

export class UserAlreadyInRoomError extends Error {
  constructor(userId: string, roomId: string) {
    super(`User "${userId}" is already in room "${roomId}"`);
    this.name = 'UserAlreadyInRoomError';
  }
}

export class RoomFullError extends Error {
  constructor(roomId: string) {
    super(`Room "${roomId}" is full`);
    this.name = 'RoomFullError';
  }
}

export class JoinRoomUseCase implements IJoinRoomUseCase {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly roomMemberRepository: IRoomMemberRepository,
  ) {}

  async execute(input: JoinRoomInput): Promise<JoinRoomOutput> {
    const room = await this.roomRepository.findById(input.roomId);
    if (!room) {
      throw new RoomNotFoundError(input.roomId);
    }

    if (room.status !== 'waiting') {
      throw new RoomNotWaitingError(input.roomId, room.status);
    }

    const existingMember = await this.roomMemberRepository.findByRoomAndUser(
      input.roomId,
      input.userId,
    );
    if (existingMember) {
      throw new UserAlreadyInRoomError(input.userId, input.roomId);
    }

    const memberCount = await this.roomMemberRepository.countByRoomId(input.roomId);
    if (memberCount >= room.maxPlayers) {
      throw new RoomFullError(input.roomId);
    }

    const roomMember = await this.roomMemberRepository.create({
      roomId: input.roomId,
      userId: input.userId,
    });

    return { roomMember };
  }
}
