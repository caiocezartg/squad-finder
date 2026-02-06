import type { Room } from '@domain/entities/room.entity';
import type { IRoomRepository } from '@domain/repositories/room.repository';

export interface CreateRoomInput {
  readonly name: string;
  readonly hostId: string;
  readonly maxPlayers?: number;
  readonly isPrivate?: boolean;
}

export interface CreateRoomOutput {
  readonly room: Room;
}

export interface ICreateRoomUseCase {
  execute(input: CreateRoomInput): Promise<CreateRoomOutput>;
}

const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 6;

function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return code;
}

export class CreateRoomUseCase implements ICreateRoomUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(input: CreateRoomInput): Promise<CreateRoomOutput> {
    const code = generateRoomCode();

    const room = await this.roomRepository.create({
      name: input.name,
      hostId: input.hostId,
      maxPlayers: input.maxPlayers ?? 10,
      isPrivate: input.isPrivate ?? false,
    });

    return {
      room: {
        ...room,
        code,
      },
    };
  }
}
