import { AppError } from './base.error';

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';

  constructor(message: string) {
    super(message);
  }
}

export class EmailAlreadyExistsError extends AppError {
  readonly statusCode = 409;
  readonly code = 'EMAIL_ALREADY_EXISTS';

  constructor(email: string) {
    super(`User with email "${email}" already exists`);
  }
}

export class UserAlreadyInRoomError extends AppError {
  readonly statusCode = 409;
  readonly code = 'USER_ALREADY_IN_ROOM';

  constructor(userId: string, roomId: string) {
    super(`User "${userId}" is already in room "${roomId}"`);
  }
}
