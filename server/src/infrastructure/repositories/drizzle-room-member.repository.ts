import { eq, and, count } from 'drizzle-orm';
import type { CreateRoomMemberInput, RoomMember } from '@domain/entities/room-member.entity';
import type { IRoomMemberRepository } from '@domain/repositories/room-member.repository';
import type { Database } from '@infrastructure/database/drizzle';
import { roomMembers, type RoomMemberRow } from '@infrastructure/database/schema/room-members';

function mapRowToEntity(row: RoomMemberRow): RoomMember {
  return {
    id: row.id,
    roomId: row.roomId,
    userId: row.userId,
    joinedAt: row.joinedAt,
  };
}

export class DrizzleRoomMemberRepository implements IRoomMemberRepository {
  constructor(private readonly db: Database) {}

  async findByRoomId(roomId: string): Promise<RoomMember[]> {
    const result = await this.db.select().from(roomMembers).where(eq(roomMembers.roomId, roomId));
    return result.map(mapRowToEntity);
  }

  async findByUserId(userId: string): Promise<RoomMember[]> {
    const result = await this.db.select().from(roomMembers).where(eq(roomMembers.userId, userId));
    return result.map(mapRowToEntity);
  }

  async findByRoomAndUser(roomId: string, userId: string): Promise<RoomMember | null> {
    const result = await this.db
      .select()
      .from(roomMembers)
      .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)))
      .limit(1);
    const row = result[0];
    return row ? mapRowToEntity(row) : null;
  }

  async create(input: CreateRoomMemberInput): Promise<RoomMember> {
    const result = await this.db
      .insert(roomMembers)
      .values({
        roomId: input.roomId,
        userId: input.userId,
      })
      .returning();

    const row = result[0];
    if (!row) {
      throw new Error('Failed to create room member');
    }
    return mapRowToEntity(row);
  }

  async delete(roomId: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(roomMembers)
      .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)))
      .returning({ id: roomMembers.id });
    return result.length > 0;
  }

  async deleteByRoomId(roomId: string): Promise<boolean> {
    const result = await this.db
      .delete(roomMembers)
      .where(eq(roomMembers.roomId, roomId))
      .returning({ id: roomMembers.id });
    return result.length > 0;
  }

  async countByRoomId(roomId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(roomMembers)
      .where(eq(roomMembers.roomId, roomId));
    return result[0]?.count ?? 0;
  }
}
