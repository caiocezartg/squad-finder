import { AppError } from './base.error'

export class ValidationError extends AppError {
  readonly statusCode = 400
  readonly code = 'VALIDATION_ERROR'

  constructor(message: string) {
    super(message)
  }
}

export class InvalidGameError extends AppError {
  readonly statusCode = 400
  readonly code = 'INVALID_GAME'

  constructor(gameId: string) {
    super(`Game with id "${gameId}" does not exist`)
  }
}
