import type { Database } from '@infrastructure/database/drizzle'
import { DrizzleRoomRepository } from '@infrastructure/repositories/drizzle-room.repository'
import { DrizzleRoomMemberRepository } from '@infrastructure/repositories/drizzle-room-member.repository'
import { DrizzleGameRepository } from '@infrastructure/repositories/drizzle-game.repository'
import { DrizzleUserRepository } from '@infrastructure/repositories/drizzle-user.repository'
import { DrizzleUserNotificationRepository } from '@infrastructure/repositories/drizzle-user-notification.repository'
import { CreateRoomUseCase } from '@application/use-cases/room/create-room.use-case'
import { GetAvailableRoomsUseCase } from '@application/use-cases/room/get-available-rooms.use-case'
import { GetRoomByCodeUseCase } from '@application/use-cases/room/get-room-by-code.use-case'
import { JoinRoomUseCase } from '@application/use-cases/room/join-room.use-case'
import { LeaveRoomUseCase } from '@application/use-cases/room/leave-room.use-case'
import { NotifyRoomReadyUseCase } from '@application/use-cases/room/notify-room-ready.use-case'
import { RoomController } from '@interface/controllers/room.controller'

export function createRoomController(db: Database) {
  const roomRepository = new DrizzleRoomRepository(db)
  const roomMemberRepository = new DrizzleRoomMemberRepository(db)
  const gameRepository = new DrizzleGameRepository(db)
  const userRepository = new DrizzleUserRepository(db)
  const userNotificationRepository = new DrizzleUserNotificationRepository(db)

  const createRoomUseCase = new CreateRoomUseCase(
    roomRepository,
    gameRepository,
    roomMemberRepository
  )
  const getAvailableRoomsUseCase = new GetAvailableRoomsUseCase(
    roomRepository,
    roomMemberRepository
  )
  const getRoomByCodeUseCase = new GetRoomByCodeUseCase(roomRepository)
  const joinRoomUseCase = new JoinRoomUseCase(roomRepository, roomMemberRepository)
  const leaveRoomUseCase = new LeaveRoomUseCase(roomRepository, roomMemberRepository)
  const notifyRoomReadyUseCase = new NotifyRoomReadyUseCase(
    roomRepository,
    roomMemberRepository,
    userRepository,
    gameRepository,
    userNotificationRepository
  )

  return new RoomController({
    createRoomUseCase,
    getAvailableRoomsUseCase,
    getRoomByCodeUseCase,
    joinRoomUseCase,
    leaveRoomUseCase,
    notifyRoomReadyUseCase,
  })
}
