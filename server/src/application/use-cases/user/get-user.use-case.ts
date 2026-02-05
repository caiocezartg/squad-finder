import type { User } from '@domain/entities/user.entity';
import type { IUserRepository } from '@domain/repositories/user.repository';

export interface GetUserInput {
  readonly id: string;
}

export interface GetUserOutput {
  readonly user: User | null;
}

export interface IGetUserUseCase {
  execute(input: GetUserInput): Promise<GetUserOutput>;
}

export class GetUserUseCase implements IGetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: GetUserInput): Promise<GetUserOutput> {
    const user = await this.userRepository.findById(input.id);
    return { user };
  }
}
