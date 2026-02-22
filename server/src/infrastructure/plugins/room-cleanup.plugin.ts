import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { DrizzleRoomRepository } from '@infrastructure/repositories/drizzle-room.repository'
import { DeleteExpiredRoomsUseCase } from '@application/use-cases/room/delete-expired-rooms.use-case'
import { ROOM } from '@config/constants'

async function markLegacyFullRooms(fastify: FastifyInstance): Promise<void> {
  const repository = new DrizzleRoomRepository(fastify.db)
  const waitingRooms = await repository.findAvailable()
  const fullRooms = waitingRooms.filter(
    (room) =>
      room.memberCount !== undefined &&
      room.memberCount >= room.maxPlayers &&
      room.completedAt === null
  )

  for (const room of fullRooms) {
    await repository.update(room.id, {
      completedAt: new Date(),
    })
  }

  if (fullRooms.length > 0) {
    fastify.log.info(`Marked ${fullRooms.length} legacy full room(s) for cleanup`)
  }
}

async function roomCleanupPlugin(fastify: FastifyInstance): Promise<void> {
  let intervalId: ReturnType<typeof setInterval>

  fastify.addHook('onReady', async () => {
    // Mark any existing full rooms that were never transitioned to 'finished'
    try {
      await markLegacyFullRooms(fastify)
    } catch (error) {
      fastify.log.error(error, 'Failed to mark legacy full rooms')
    }

    fastify.log.info(`Room cleanup scheduler started (interval: ${ROOM.CLEANUP_INTERVAL_MS / 1000}s, expiration: ${ROOM.EXPIRATION_MINUTES}min)`)

    intervalId = setInterval(async () => {
      try {
        const repository = new DrizzleRoomRepository(fastify.db)
        const useCase = new DeleteExpiredRoomsUseCase(repository)
        const result = await useCase.execute({ expirationMinutes: ROOM.EXPIRATION_MINUTES })

        for (const room of result.deletedRooms) {
          fastify.broadcaster.broadcastRoomDeleted(room.id, room.code)
        }

        if (result.deletedRooms.length > 0) {
          fastify.log.info(`Cleaned up ${result.deletedRooms.length} expired room(s)`)
        }
      } catch (error) {
        fastify.log.error(error, 'Room cleanup failed')
      }
    }, ROOM.CLEANUP_INTERVAL_MS)
  })

  fastify.addHook('onClose', () => {
    clearInterval(intervalId)
  })
}

export default fp(roomCleanupPlugin, {
  name: 'room-cleanup',
  dependencies: ['database', 'websocket-handler'],
})
