import { eq } from 'drizzle-orm'
import type { CreateUserInput, UpdateUserInput, User } from '@domain/entities/user.entity'
import type { IUserRepository } from '@domain/repositories/user.repository'
import type { Database } from '@infrastructure/database/drizzle'
import { user, type UserRow } from '@infrastructure/database/schema/auth'

function mapRowToEntity(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.image, // Better Auth uses 'image', domain uses 'avatarUrl'
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export class DrizzleUserRepository implements IUserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db.select().from(user).where(eq(user.id, id)).limit(1)
    const row = result[0]
    return row ? mapRowToEntity(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.select().from(user).where(eq(user.email, email)).limit(1)
    const row = result[0]
    return row ? mapRowToEntity(row) : null
  }

  async findAll(): Promise<User[]> {
    const result = await this.db.select().from(user)
    return result.map(mapRowToEntity)
  }

  async create(input: CreateUserInput): Promise<User> {
    const result = await this.db
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        email: input.email,
        name: input.name,
        image: input.avatarUrl ?? null,
      })
      .returning()

    const row = result[0]
    if (!row) {
      throw new Error('Failed to create user')
    }
    return mapRowToEntity(row)
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const updateData: Partial<{ name: string; image: string | null; updatedAt: Date }> = {
      updatedAt: new Date(),
    }

    if (input.name !== undefined) {
      updateData.name = input.name
    }
    if (input.avatarUrl !== undefined) {
      updateData.image = input.avatarUrl
    }

    const result = await this.db.update(user).set(updateData).where(eq(user.id, id)).returning()

    const row = result[0]
    return row ? mapRowToEntity(row) : null
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(user).where(eq(user.id, id)).returning({ id: user.id })
    return result.length > 0
  }
}
