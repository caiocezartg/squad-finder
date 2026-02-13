import type { IRoomRepository } from '@domain/repositories/room.repository';

export interface DeleteExpiredRoomsInput {
  readonly expirationMinutes: number;
}

export interface DeletedRoom {
  readonly id: string;
  readonly code: string;
}

export interface DeleteExpiredRoomsOutput {
  readonly deletedRooms: DeletedRoom[];
}

export interface IDeleteExpiredRoomsUseCase {
  execute(input: DeleteExpiredRoomsInput): Promise<DeleteExpiredRoomsOutput>;
}

export class DeleteExpiredRoomsUseCase implements IDeleteExpiredRoomsUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: DeleteExpiredRoomsInput): Promise<DeleteExpiredRoomsOutput> {
    const cutoff = new Date(Date.now() - input.expirationMinutes * 60_000);
    const expiredRooms = await this.roomRepository.findExpiredRooms(cutoff);

    const deletedRooms: DeletedRoom[] = [];

    for (const room of expiredRooms) {
      const deleted = await this.roomRepository.delete(room.id);
      if (deleted) {
        deletedRooms.push({ id: room.id, code: room.code });
      }
    }

    return { deletedRooms };
  }
}
