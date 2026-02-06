import type { User } from '@domain/entities/user.entity';
import type { IUserRepository } from '@domain/repositories/user.repository';
import { EmailAlreadyExistsError } from '@application/errors';

export interface CreateUserInput {
  readonly email: string;
  readonly name: string;
  readonly avatarUrl?: string | null;
}

export interface CreateUserOutput {
  readonly user: User;
}

export interface ICreateUserUseCase {
  execute(input: CreateUserInput): Promise<CreateUserOutput>;
}

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new EmailAlreadyExistsError(input.email);
    }

    const user = await this.userRepository.create({
      email: input.email,
      name: input.name,
      avatarUrl: input.avatarUrl ?? null,
    });

    return { user };
  }
}
