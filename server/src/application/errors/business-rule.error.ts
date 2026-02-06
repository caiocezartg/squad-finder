import { AppError } from './base.error';

export class RoomNotWaitingError extends AppError {
  readonly statusCode = 422;
  readonly code = 'ROOM_NOT_WAITING';

  constructor(roomId: string, status: string) {
    super(`Room "${roomId}" is not accepting players (status: ${status})`);
  }
}

export class RoomFullError extends AppError {
  readonly statusCode = 422;
  readonly code = 'ROOM_FULL';

  constructor(roomId: string) {
    super(`Room "${roomId}" is full`);
  }
}

export class NotRoomMemberError extends AppError {
  readonly statusCode = 422;
  readonly code = 'NOT_ROOM_MEMBER';

  constructor(userId: string, roomId: string) {
    super(`User "${userId}" is not a member of room "${roomId}"`);
  }
}
