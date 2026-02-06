import type { User } from '@domain/entities/user.entity';
import type { IUserRepository } from '@domain/repositories/user.repository';

export interface UpdateUserInput {
  readonly id: string;
  readonly name?: string;
  readonly avatarUrl?: string | null;
}

export interface UpdateUserOutput {
  readonly user: User | null;
}

export interface IUpdateUserUseCase {
  execute(input: UpdateUserInput): Promise<UpdateUserOutput>;
}

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
    const { id, ...updateData } = input;

    const user = await this.userRepository.update(id, updateData);

    return { user };
  }
}
