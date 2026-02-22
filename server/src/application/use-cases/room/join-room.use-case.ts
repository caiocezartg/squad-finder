import type { RoomMember } from '@domain/entities/room-member.entity'
import type { IRoomRepository } from '@domain/repositories/room.repository'
import type { IRoomMemberRepository } from '@domain/repositories/room-member.repository'
import {
  RoomNotFoundError,
  RoomNotWaitingError,
  RoomFullError,
  RoomJoinLimitReachedError,
} from '@application/errors'
import { ROOM } from '@config/constants'

export interface JoinRoomInput {
  readonly roomId: string
  readonly userId: string
}

export interface JoinRoomOutput {
  readonly roomMember: RoomMember
  readonly memberCount: number
  readonly isRoomNowFull: boolean
}

export interface IJoinRoomUseCase {
  execute(input: JoinRoomInput): Promise<JoinRoomOutput>
}

export class JoinRoomUseCase implements IJoinRoomUseCase {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly roomMemberRepository: IRoomMemberRepository
  ) {}

  async execute(input: JoinRoomInput): Promise<JoinRoomOutput> {
    const room = await this.roomRepository.findById(input.roomId)
    if (!room) {
      throw new RoomNotFoundError(input.roomId)
    }

    if (room.status !== 'waiting') {
      throw new RoomNotWaitingError(input.roomId, room.status)
    }

    // If user is already a member, return their existing membership (idempotent)
    const existingMember = await this.roomMemberRepository.findByRoomAndUser(
      input.roomId,
      input.userId
    )
    if (existingMember) {
      const memberCount = await this.roomMemberRepository.countByRoomId(input.roomId)
      return { roomMember: existingMember, memberCount, isRoomNowFull: false }
    }

    // Enforce membership limit: max 5 active rooms
    const activeMembershipCount = await this.roomMemberRepository.countActiveByUserId(input.userId)
    if (activeMembershipCount >= ROOM.JOIN_LIMIT) {
      throw new RoomJoinLimitReachedError(ROOM.JOIN_LIMIT)
    }

    const memberCount = await this.roomMemberRepository.countByRoomId(input.roomId)
    if (memberCount >= room.maxPlayers) {
      throw new RoomFullError(input.roomId)
    }

    const roomMember = await this.roomMemberRepository.create({
      roomId: input.roomId,
      userId: input.userId,
    })

    // Set completedAt when room reaches max players (triggers auto-deletion after 5 min)
    const newMemberCount = await this.roomMemberRepository.countByRoomId(input.roomId)
    const isRoomNowFull = newMemberCount >= room.maxPlayers

    if (isRoomNowFull) {
      await this.roomRepository.update(input.roomId, {
        completedAt: new Date(),
      })
      await this.roomRepository.markReadyNotified(input.roomId, new Date())
    }

    return { roomMember, memberCount: newMemberCount, isRoomNowFull }
  }
}
