import type { FastifyReply, FastifyRequest } from 'fastify'
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
import { RoomNotFoundError, InvalidGameError, NotRoomMemberError } from '@application/errors'
import { createRoomRequestSchema, roomCodeParamSchema } from '@application/dtos'
import {
  broadcastRoomCreated,
  broadcastRoomUpdated,
  broadcastRoomDeleted,
} from '@infrastructure/websocket/handlers/room.handler'

export class RoomController {
  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const roomRepository = new DrizzleRoomRepository(request.server.db)
    const useCase = new GetAvailableRoomsUseCase(roomRepository)
    const result = await useCase.execute()

    const userId = request.session?.user?.id

    if (userId) {
      const roomMemberRepository = new DrizzleRoomMemberRepository(request.server.db)
      const memberships = await roomMemberRepository.findByUserId(userId)
      const memberRoomIds = new Set(memberships.map((m) => m.roomId))

      const rooms = result.rooms.map((room) => ({
        ...room,
        isMember: memberRoomIds.has(room.id),
      }))

      await reply.send({ rooms })
      return
    }

    await reply.send({ rooms: result.rooms })
  }

  async getByCode(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = roomCodeParamSchema.parse(request.params)

    const roomRepository = new DrizzleRoomRepository(request.server.db)
    const useCase = new GetRoomByCodeUseCase(roomRepository)
    const result = await useCase.execute({ code: params.code })

    if (!result.room) {
      throw new RoomNotFoundError(params.code)
    }

    await reply.send({ room: result.room })
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.userId
    const body = createRoomRequestSchema.parse(request.body)

    const gameRepository = new DrizzleGameRepository(request.server.db)
    const game = await gameRepository.findById(body.gameId)

    if (!game) {
      throw new InvalidGameError(body.gameId)
    }

    // Use game's maxPlayers as default if not provided
    const maxPlayers = body.maxPlayers ?? game.maxPlayers

    const roomRepository = new DrizzleRoomRepository(request.server.db)
    const roomMemberRepository = new DrizzleRoomMemberRepository(request.server.db)
    const useCase = new CreateRoomUseCase(roomRepository)

    const result = await useCase.execute({
      name: body.name,
      hostId: userId,
      gameId: body.gameId,
      maxPlayers,
      discordLink: body.discordLink,
    })

    // Add host as first member
    await roomMemberRepository.create({
      roomId: result.room.id,
      userId,
    })

    // Broadcast to lobby subscribers
    broadcastRoomCreated(result.room)

    await reply.status(201).send({ room: result.room })
  }

  async join(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.userId
    const params = roomCodeParamSchema.parse(request.params)

    const roomRepository = new DrizzleRoomRepository(request.server.db)
    const roomMemberRepository = new DrizzleRoomMemberRepository(request.server.db)

    const room = await roomRepository.findByCode(params.code)
    if (!room) {
      throw new RoomNotFoundError(params.code)
    }

    const useCase = new JoinRoomUseCase(roomRepository, roomMemberRepository)
    const result = await useCase.execute({
      roomId: room.id,
      userId,
    })

    const memberCount = await roomMemberRepository.countByRoomId(room.id)

    // Update member count for lobby viewers
    broadcastRoomUpdated(room.id, room.code, memberCount)

    if (memberCount >= room.maxPlayers) {
      const markedAsNotified = await roomRepository.markReadyNotified(room.id, new Date())

      if (markedAsNotified) {
        try {
          const userRepository = new DrizzleUserRepository(request.server.db)
          const gameRepository = new DrizzleGameRepository(request.server.db)
          const userNotificationRepository = new DrizzleUserNotificationRepository(request.server.db)

          const notifyRoomReadyUseCase = new NotifyRoomReadyUseCase(
            roomRepository,
            roomMemberRepository,
            userRepository,
            gameRepository,
            userNotificationRepository
          )

          const notificationResult = await notifyRoomReadyUseCase.execute({ roomId: room.id })
          request.server.log.info(
            {
              roomId: room.id,
              roomCode: room.code,
              ...notificationResult,
            },
            'Room ready notifications processed'
          )
        } catch (error) {
          request.server.log.error(
            {
              roomId: room.id,
              roomCode: room.code,
              error,
            },
            'Failed to process room ready notifications'
          )
        }
      }
    }

    await reply.send({
      message: 'Joined room successfully',
      roomMember: result.roomMember,
    })
  }

  async leave(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.userId
    const params = roomCodeParamSchema.parse(request.params)

    const roomRepository = new DrizzleRoomRepository(request.server.db)
    const roomMemberRepository = new DrizzleRoomMemberRepository(request.server.db)

    const room = await roomRepository.findByCode(params.code)
    if (!room) {
      throw new RoomNotFoundError(params.code)
    }

    // Check if user is host before leaving (room will be deleted if host leaves)
    const isHost = room.hostId === userId

    const useCase = new LeaveRoomUseCase(roomRepository, roomMemberRepository)
    const result = await useCase.execute({
      roomId: room.id,
      userId,
    })

    if (!result.success) {
      throw new NotRoomMemberError(userId, room.id)
    }

    if (isHost) {
      // Host left — room was deleted, broadcast to lobby
      broadcastRoomDeleted(room.id, room.code)
    } else {
      // Regular member left — update member count for lobby viewers
      const memberCount = await roomMemberRepository.countByRoomId(room.id)
      broadcastRoomUpdated(room.id, room.code, memberCount)
    }

    await reply.send({
      message: 'Left room successfully',
      success: true,
    })
  }
}
