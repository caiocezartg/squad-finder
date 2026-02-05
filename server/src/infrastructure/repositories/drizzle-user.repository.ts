import { eq } from 'drizzle-orm';
import type { CreateUserInput, UpdateUserInput, User } from '@domain/entities/user.entity';
import type { IUserRepository } from '@domain/repositories/user.repository';
import type { Database } from '@infrastructure/database/drizzle';
import { users, type UserRow } from '@infrastructure/database/schema/users';

function mapRowToEntity(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleUserRepository implements IUserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    const row = result[0];
    return row ? mapRowToEntity(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    const row = result[0];
    return row ? mapRowToEntity(row) : null;
  }

  async findAll(): Promise<User[]> {
    const result = await this.db.select().from(users);
    return result.map(mapRowToEntity);
  }

  async create(input: CreateUserInput): Promise<User> {
    const result = await this.db
      .insert(users)
      .values({
        email: input.email,
        name: input.name,
        avatarUrl: input.avatarUrl ?? null,
      })
      .returning();

    const row = result[0];
    if (!row) {
      throw new Error('Failed to create user');
    }
    return mapRowToEntity(row);
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const updateData: Partial<{ name: string; avatarUrl: string | null; updatedAt: Date }> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.avatarUrl !== undefined) {
      updateData.avatarUrl = input.avatarUrl;
    }

    const result = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    const row = result[0];
    return row ? mapRowToEntity(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
    return result.length > 0;
  }
}
