import { vi, type Mock } from 'vitest'
import type { User, CreateUserInput, UpdateUserInput } from '@domain/entities/user.entity'
import type { IUserRepository } from '@domain/repositories/user.repository'

export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'user-uuid-1',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }
}

export type MockUserRepository = {
  [K in keyof IUserRepository]: Mock<IUserRepository[K]>
}

export function createMockUserRepository(): MockUserRepository {
  return {
    findById: vi.fn<(id: string) => Promise<User | null>>().mockResolvedValue(null),
    findByEmail: vi.fn<(email: string) => Promise<User | null>>().mockResolvedValue(null),
    findAll: vi.fn<() => Promise<User[]>>().mockResolvedValue([]),
    create: vi.fn<(input: CreateUserInput) => Promise<User>>().mockImplementation((input) =>
      Promise.resolve(
        createMockUser({
          email: input.email,
          name: input.name,
          avatarUrl: input.avatarUrl ?? null,
        })
      )
    ),
    update: vi
      .fn<(id: string, input: UpdateUserInput) => Promise<User | null>>()
      .mockResolvedValue(null),
    delete: vi.fn<(id: string) => Promise<boolean>>().mockResolvedValue(false),
  }
}
