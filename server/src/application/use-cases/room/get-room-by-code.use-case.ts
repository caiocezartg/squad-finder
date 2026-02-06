import type { Room } from '@domain/entities/room.entity';
import type { IRoomRepository } from '@domain/repositories/room.repository';

export interface GetRoomByCodeInput {
  readonly code: string;
}

export interface GetRoomByCodeOutput {
  readonly room: Room | null;
}

export interface IGetRoomByCodeUseCase {
  execute(input: GetRoomByCodeInput): Promise<GetRoomByCodeOutput>;
}

export class GetRoomByCodeUseCase implements IGetRoomByCodeUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: GetRoomByCodeInput): Promise<GetRoomByCodeOutput> {
    const room = await this.roomRepository.findByCode(input.code);
    return { room };
  }
}
