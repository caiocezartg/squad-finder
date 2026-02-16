import type { CreateUserInput, UpdateUserInput, User } from '@domain/entities/user.entity'

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findAll(): Promise<User[]>
  create(input: CreateUserInput): Promise<User>
  update(id: string, input: UpdateUserInput): Promise<User | null>
  delete(id: string): Promise<boolean>
}
