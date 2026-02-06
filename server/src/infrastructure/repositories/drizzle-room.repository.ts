import { eq, and } from 'drizzle-orm';
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
    status: row.status,
    maxPlayers: row.maxPlayers,
    isPrivate: row.isPrivate,
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
    const result = await this.db
      .select()
      .from(rooms)
      .where(and(eq(rooms.status, 'waiting'), eq(rooms.isPrivate, false)));
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
        maxPlayers: input.maxPlayers ?? 10,
        isPrivate: input.isPrivate ?? false,
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
      isPrivate: boolean;
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
    if (input.isPrivate !== undefined) {
      updateData.isPrivate = input.isPrivate;
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
