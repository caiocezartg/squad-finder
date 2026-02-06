import type { Room } from '@domain/entities/room.entity';
import type { IRoomRepository } from '@domain/repositories/room.repository';

export interface GetAvailableRoomsOutput {
  readonly rooms: Room[];
}

export interface IGetAvailableRoomsUseCase {
  execute(): Promise<GetAvailableRoomsOutput>;
}

export class GetAvailableRoomsUseCase implements IGetAvailableRoomsUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(): Promise<GetAvailableRoomsOutput> {
    const rooms = await this.roomRepository.findAvailable();
    return { rooms };
  }
}
