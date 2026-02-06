import { eq } from 'drizzle-orm';
import type { CreateRoomInput, Room, UpdateRoomInput } from '@domain/entities/room.entity';
import type { IRoomRepository } from '@domain/repositories/room.repository';
import type { Database } from '@infrastructure/database/drizzle';
import { rooms, type RoomRow } from '@infrastructure/database/schema/rooms';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function mapRowToEntity(row: RoomRow): Room {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    hostId: row.hostId,
    gameId: row.gameId,
    status: row.status,
    maxPlayers: row.maxPlayers,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleRoomRepository implements IRoomRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Room | null> {
    const result = await this.db.select().from(rooms).where(eq(rooms.id, id)).limit(1);
    const row = result[0];
    return row ? mapRowToEntity(row) : null;
  }

  async findByCode(code: string): Promise<Room | null> {
    const result = await this.db.select().from(rooms).where(eq(rooms.code, code)).limit(1);
    const row = result[0];
    return row ? mapRowToEntity(row) : null;
  }

  async findByHostId(hostId: string): Promise<Room[]> {
    const result = await this.db.select().from(rooms).where(eq(rooms.hostId, hostId));
    return result.map(mapRowToEntity);
  }

  async findAll(): Promise<Room[]> {
    const result = await this.db.select().from(rooms);
    return result.map(mapRowToEntity);
  }

  async findAvailable(): Promise<Room[]> {
    const result = await this.db.select().from(rooms).where(eq(rooms.status, 'waiting'));
    return result.map(mapRowToEntity);
  }

  async create(input: CreateRoomInput): Promise<Room> {
    const code = generateRoomCode();

    const result = await this.db
      .insert(rooms)
      .values({
        code,
        name: input.name,
        hostId: input.hostId,
        gameId: input.gameId,
        maxPlayers: input.maxPlayers ?? 5,
      })
      .returning();

    const row = result[0];
    if (!row) {
      throw new Error('Failed to create room');
    }
    return mapRowToEntity(row);
  }

  async update(id: string, input: UpdateRoomInput): Promise<Room | null> {
    const updateData: Partial<{
      name: string;
      status: 'waiting' | 'playing' | 'finished';
      maxPlayers: number;
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.maxPlayers !== undefined) {
      updateData.maxPlayers = input.maxPlayers;
    }

    const result = await this.db.update(rooms).set(updateData).where(eq(rooms.id, id)).returning();

    const row = result[0];
    return row ? mapRowToEntity(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(rooms).where(eq(rooms.id, id)).returning({ id: rooms.id });
    return result.length > 0;
  }
}
