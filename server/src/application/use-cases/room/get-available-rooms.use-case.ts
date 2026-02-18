import type { Room } from '@domain/entities/room.entity'
import type { IRoomRepository } from '@domain/repositories/room.repository'
import type { IRoomMemberRepository } from '@domain/repositories/room-member.repository'

export interface GetAvailableRoomsInput {
  readonly userId?: string
}

export type AvailableRoom = Room & { isMember?: boolean }

export interface GetAvailableRoomsOutput {
  readonly rooms: AvailableRoom[]
}

export interface IGetAvailableRoomsUseCase {
  execute(input?: GetAvailableRoomsInput): Promise<GetAvailableRoomsOutput>
}

export class GetAvailableRoomsUseCase implements IGetAvailableRoomsUseCase {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly roomMemberRepository: IRoomMemberRepository
  ) {}

  async execute(input?: GetAvailableRoomsInput): Promise<GetAvailableRoomsOutput> {
    const rooms = await this.roomRepository.findAvailable()

    if (input?.userId) {
      const memberships = await this.roomMemberRepository.findByUserId(input.userId)
      const memberRoomIds = new Set(memberships.map((m) => m.roomId))

      return {
        rooms: rooms.map((room) => ({
          ...room,
          isMember: memberRoomIds.has(room.id),
        })),
      }
    }

    return { rooms }
  }
}
