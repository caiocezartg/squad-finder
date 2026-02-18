import type { Database } from '@infrastructure/database/drizzle'
import { DrizzleUserRepository } from '@infrastructure/repositories/drizzle-user.repository'
import { DrizzleUserNotificationRepository } from '@infrastructure/repositories/drizzle-user-notification.repository'
import { GetUserUseCase } from '@application/use-cases/user/get-user.use-case'
import { UserController } from '@interface/controllers/user.controller'

export function createUserController(db: Database) {
  const userRepository = new DrizzleUserRepository(db)
  const userNotificationRepository = new DrizzleUserNotificationRepository(db)

  const getUserUseCase = new GetUserUseCase(userRepository)

  return new UserController({
    getUserUseCase,
    userNotificationRepository,
  })
}
