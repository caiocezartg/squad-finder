import type { CreateGameInput, Game } from '@domain/entities/game.entity';

export interface IGameRepository {
  findById(id: string): Promise<Game | null>;
  findBySlug(slug: string): Promise<Game | null>;
  findAll(): Promise<Game[]>;
  create(input: CreateGameInput): Promise<Game>;
  upsertBySlug(input: CreateGameInput): Promise<Game>;
}
