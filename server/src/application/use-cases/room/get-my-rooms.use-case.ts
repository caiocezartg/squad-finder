import type { Room } from '@domain/entities/room.entity'
import type { IRoomRepository } from '@domain/repositories/room.repository'

export interface GetMyRoomsOutput {
  readonly hosted: Room[]
  readonly joined: Room[]
}

export interface IGetMyRoomsUseCase {
  execute(input: { userId: string }): Promise<GetMyRoomsOutput>
}

export class GetMyRoomsUseCase implements IGetMyRoomsUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: { userId: string }): Promise<GetMyRoomsOutput> {
    return this.roomRepository.findMyRooms(input.userId)
  }
}
