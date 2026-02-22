import { ApiClientError } from './api'

const ERROR_MESSAGES: Record<string, string> = {
  ROOM_NOT_FOUND: 'This room no longer exists or the code is invalid.',
  ROOM_FULL: 'This room is already full.',
  ROOM_NOT_WAITING: 'This room is no longer accepting players.',
  ROOM_COMPLETED: 'This room has already been completed.',
  ALREADY_IN_ROOM: 'You are already a member of this room.',
  NOT_ROOM_MEMBER: 'You are not a member of this room.',
  ROOM_CREATE_LIMIT_REACHED: 'You have reached the maximum number of active rooms.',
  ROOM_JOIN_LIMIT_REACHED: 'You have reached the maximum number of rooms you can join.',
  VALIDATION_ERROR: 'Please check the form fields and try again.',
  UNAUTHORIZED: 'You need to sign in to do this.',
  INTERNAL_ERROR: 'Something went wrong. Please try again later.',
}

export function getUserFriendlyError(error: unknown): string {
  if (error instanceof ApiClientError && error.code) {
    return ERROR_MESSAGES[error.code] ?? error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}
