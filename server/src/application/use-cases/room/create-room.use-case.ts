import type { Room } from '@domain/entities/room.entity'
import type { IRoomRepository } from '@domain/repositories/room.repository'

export interface CreateRoomInput {
  readonly name: string
  readonly hostId: string
  readonly gameId: string
  readonly maxPlayers?: number
  readonly discordLink: string
}

export interface CreateRoomOutput {
  readonly room: Room
}

export interface ICreateRoomUseCase {
  execute(input: CreateRoomInput): Promise<CreateRoomOutput>
}

export class CreateRoomUseCase implements ICreateRoomUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: CreateRoomInput): Promise<CreateRoomOutput> {
    const room = await this.roomRepository.create({
      name: input.name,
      hostId: input.hostId,
      gameId: input.gameId,
      maxPlayers: input.maxPlayers,
      discordLink: input.discordLink,
    })

    return { room }
  }
}
