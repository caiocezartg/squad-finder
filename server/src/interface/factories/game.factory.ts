import type { Database } from '@infrastructure/database/drizzle'
import { DrizzleGameRepository } from '@infrastructure/repositories/drizzle-game.repository'
import { GameController } from '@interface/controllers/game.controller'

export function createGameController(db: Database) {
  const gameRepository = new DrizzleGameRepository(db)

  return new GameController({ gameRepository })
}
