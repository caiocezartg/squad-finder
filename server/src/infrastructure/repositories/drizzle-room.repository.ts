import { and, eq, count, gte, isNull, lte, or } from 'drizzle-orm'
import type { CreateRoomInput, Room, UpdateRoomInput } from '@domain/entities/room.entity'
import type { IRoomRepository } from '@domain/repositories/room.repository'
import type { Database } from '@infrastructure/database/drizzle'
import { rooms, type RoomRow } from '@infrastructure/database/schema/rooms'
import { roomMembers } from '@infrastructure/database/schema/room-members'

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
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
    discordLink: row.discordLink,
    tags: row.tags,
    language: row.language as 'en' | 'pt-br',
    completedAt: row.completedAt,
    readyNotifiedAt: row.readyNotifiedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export class DrizzleRoomRepository implements IRoomRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Room | null> {
    const result = await this.db.select().from(rooms).where(eq(rooms.id, id)).limit(1)
    const row = result[0]
    return row ? mapRowToEntity(row) : null
  }

  async findByCode(code: string): Promise<Room | null> {
    const result = await this.db.select().from(rooms).where(eq(rooms.code, code)).limit(1)
    const row = result[0]
    return row ? mapRowToEntity(row) : null
  }

  async findByHostId(hostId: string): Promise<Room[]> {
    const result = await this.db.select().from(rooms).where(eq(rooms.hostId, hostId))
    return result.map(mapRowToEntity)
  }

  async findAll(): Promise<Room[]> {
    const result = await this.db.select().from(rooms)
    return result.map(mapRowToEntity)
  }

  async findAvailable(): Promise<Room[]> {
    const result = await this.db
      .select({
        room: rooms,
        memberCount: count(roomMembers.id),
      })
      .from(rooms)
      .leftJoin(roomMembers, eq(rooms.id, roomMembers.roomId))
      .where(
        and(
          eq(rooms.status, 'waiting'),
          or(
            isNull(rooms.completedAt),
            gte(rooms.completedAt, new Date(Date.now() - 5 * 60_000))
          )
        )
      )
      .groupBy(rooms.id)

    return result.map((row) => ({
      ...mapRowToEntity(row.room),
      memberCount: row.memberCount,
    }))
  }

  async findExpiredRooms(beforeDate: Date): Promise<Room[]> {
    const result = await this.db.select().from(rooms).where(lte(rooms.completedAt, beforeDate))

    return result.map(mapRowToEntity)
  }

  async create(input: CreateRoomInput): Promise<Room> {
    const code = generateRoomCode()

    const result = await this.db
      .insert(rooms)
      .values({
        code,
        name: input.name,
        hostId: input.hostId,
        gameId: input.gameId,
        maxPlayers: input.maxPlayers ?? 5,
        discordLink: input.discordLink ?? null,
        tags: input.tags ?? [],
        language: input.language ?? 'pt-br',
      })
      .returning()

    const row = result[0]
    if (!row) {
      throw new Error('Failed to create room')
    }
    return mapRowToEntity(row)
  }

  async update(id: string, input: UpdateRoomInput): Promise<Room | null> {
    const updateData: Partial<{
      name: string
      status: 'waiting' | 'playing' | 'finished'
      maxPlayers: number
      discordLink: string
      tags: string[]
      language: string
      completedAt: Date
      readyNotifiedAt: Date
      updatedAt: Date
    }> = {
      updatedAt: new Date(),
    }

    if (input.name !== undefined) {
      updateData.name = input.name
    }
    if (input.status !== undefined) {
      updateData.status = input.status
    }
    if (input.maxPlayers !== undefined) {
      updateData.maxPlayers = input.maxPlayers
    }
    if (input.discordLink !== undefined) {
      updateData.discordLink = input.discordLink
    }
    if (input.tags !== undefined) {
      updateData.tags = input.tags
    }
    if (input.language !== undefined) {
      updateData.language = input.language
    }
    if (input.completedAt !== undefined) {
      updateData.completedAt = input.completedAt
    }
    if (input.readyNotifiedAt !== undefined) {
      updateData.readyNotifiedAt = input.readyNotifiedAt
    }

    const result = await this.db.update(rooms).set(updateData).where(eq(rooms.id, id)).returning()

    const row = result[0]
    return row ? mapRowToEntity(row) : null
  }

  async markReadyNotified(roomId: string, notifiedAt: Date): Promise<boolean> {
    const result = await this.db
      .update(rooms)
      .set({
        readyNotifiedAt: notifiedAt,
        updatedAt: new Date(),
      })
      .where(and(eq(rooms.id, roomId), isNull(rooms.readyNotifiedAt)))
      .returning({ id: rooms.id })

    return result.length > 0
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(rooms).where(eq(rooms.id, id)).returning({ id: rooms.id })
    return result.length > 0
  }
}
