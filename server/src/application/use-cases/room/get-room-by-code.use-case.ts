import type { Room } from '@domain/entities/room.entity'
import type { IRoomRepository } from '@domain/repositories/room.repository'
import type { IRoomMemberRepository } from '@domain/repositories/room-member.repository'
import type { IUserRepository } from '@domain/repositories/user.repository'
import type { Player } from '@squadzr/types/ws'

export interface GetRoomByCodeInput {
  readonly code: string
}

export interface GetRoomByCodeOutput {
  readonly room: Room | null
  readonly players: Player[]
}

export interface IGetRoomByCodeUseCase {
  execute(input: GetRoomByCodeInput): Promise<GetRoomByCodeOutput>
}

export class GetRoomByCodeUseCase implements IGetRoomByCodeUseCase {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly roomMemberRepository: IRoomMemberRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(input: GetRoomByCodeInput): Promise<GetRoomByCodeOutput> {
    const room = await this.roomRepository.findByCode(input.code)
    if (!room) {
      return { room: null, players: [] }
    }

    const members = await this.roomMemberRepository.findByRoomId(room.id)
    const userIds = members.map((m) => m.userId)
    const users = await this.userRepository.findByIds(userIds)
    const userMap = new Map(users.map((u) => [u.id, u]))

    const players: Player[] = members
      .map((m) => {
        const user = userMap.get(m.userId)
        if (!user) return null
        return {
          id: user.id,
          name: user.name,
          image: user.avatarUrl,
          isHost: user.id === room.hostId,
        }
      })
      .filter((p): p is Player => p !== null)

    return { room, players }
  }
}
