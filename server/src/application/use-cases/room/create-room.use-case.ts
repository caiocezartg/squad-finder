import type { Room } from '@domain/entities/room.entity'
import type { RoomMember } from '@domain/entities/room-member.entity'
import type { IRoomRepository } from '@domain/repositories/room.repository'
import type { IRoomMemberRepository } from '@domain/repositories/room-member.repository'
import type { IGameRepository } from '@domain/repositories/game.repository'
import { InvalidGameError, RoomCreateLimitReachedError } from '@application/errors'
import { ROOM } from '@config/constants'

export interface CreateRoomInput {
  readonly name: string
  readonly hostId: string
  readonly gameId: string
  readonly maxPlayers?: number
  readonly discordLink: string
  readonly tags?: string[]
  readonly language?: 'en' | 'pt-br'
}

export interface CreateRoomOutput {
  readonly room: Room
  readonly hostMember: RoomMember
}

export interface ICreateRoomUseCase {
  execute(input: CreateRoomInput): Promise<CreateRoomOutput>
}

export class CreateRoomUseCase implements ICreateRoomUseCase {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly gameRepository: IGameRepository,
    private readonly roomMemberRepository: IRoomMemberRepository
  ) {}

  async execute(input: CreateRoomInput): Promise<CreateRoomOutput> {
    const game = await this.gameRepository.findById(input.gameId)
    if (!game) {
      throw new InvalidGameError(input.gameId)
    }

    // Enforce host limit: max 3 active rooms
    const activeRoomCount = await this.roomRepository.countActiveByHostId(input.hostId)
    if (activeRoomCount >= ROOM.CREATE_LIMIT) {
      throw new RoomCreateLimitReachedError(ROOM.CREATE_LIMIT)
    }

    const maxPlayers = input.maxPlayers ?? game.maxPlayers

    const room = await this.roomRepository.create({
      name: input.name,
      hostId: input.hostId,
      gameId: input.gameId,
      maxPlayers,
      discordLink: input.discordLink,
      tags: input.tags,
      language: input.language,
    })

    const hostMember = await this.roomMemberRepository.create({
      roomId: room.id,
      userId: input.hostId,
    })

    return { room, hostMember }
  }
}
