import type { FastifyReply, FastifyRequest } from 'fastify';
import { DrizzleRoomRepository } from '@infrastructure/repositories/drizzle-room.repository';
import { DrizzleRoomMemberRepository } from '@infrastructure/repositories/drizzle-room-member.repository';
import { DrizzleGameRepository } from '@infrastructure/repositories/drizzle-game.repository';
import { CreateRoomUseCase } from '@application/use-cases/room/create-room.use-case';
import { GetAvailableRoomsUseCase } from '@application/use-cases/room/get-available-rooms.use-case';
import { GetRoomByCodeUseCase } from '@application/use-cases/room/get-room-by-code.use-case';
import { JoinRoomUseCase } from '@application/use-cases/room/join-room.use-case';
import { LeaveRoomUseCase } from '@application/use-cases/room/leave-room.use-case';
import { RoomNotFoundError, InvalidGameError, NotRoomMemberError } from '@application/errors';
import { createRoomRequestSchema, roomCodeParamSchema } from '@application/dtos';

export class RoomController {
  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const roomRepository = new DrizzleRoomRepository(request.server.db);
    const useCase = new GetAvailableRoomsUseCase(roomRepository);
    const result = await useCase.execute();

    await reply.send({ rooms: result.rooms });
  }

  async getByCode(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = roomCodeParamSchema.parse(request.params);

    const roomRepository = new DrizzleRoomRepository(request.server.db);
    const useCase = new GetRoomByCodeUseCase(roomRepository);
    const result = await useCase.execute({ code: params.code });

    if (!result.room) {
      throw new RoomNotFoundError(params.code);
    }

    await reply.send({ room: result.room });
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.userId;
    const body = createRoomRequestSchema.parse(request.body);

    const gameRepository = new DrizzleGameRepository(request.server.db);
    const game = await gameRepository.findById(body.gameId);

    if (!game) {
      throw new InvalidGameError(body.gameId);
    }

    // Use game's maxPlayers as default if not provided
    const maxPlayers = body.maxPlayers ?? game.maxPlayers;

    const roomRepository = new DrizzleRoomRepository(request.server.db);
    const roomMemberRepository = new DrizzleRoomMemberRepository(request.server.db);
    const useCase = new CreateRoomUseCase(roomRepository);

    const result = await useCase.execute({
      name: body.name,
      hostId: userId,
      gameId: body.gameId,
      maxPlayers,
    });

    // Add host as first member
    await roomMemberRepository.create({
      roomId: result.room.id,
      userId,
    });

    await reply.status(201).send({ room: result.room });
  }

  async join(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.userId;
    const params = roomCodeParamSchema.parse(request.params);

    const roomRepository = new DrizzleRoomRepository(request.server.db);
    const roomMemberRepository = new DrizzleRoomMemberRepository(request.server.db);

    const room = await roomRepository.findByCode(params.code);
    if (!room) {
      throw new RoomNotFoundError(params.code);
    }

    const useCase = new JoinRoomUseCase(roomRepository, roomMemberRepository);
    const result = await useCase.execute({
      roomId: room.id,
      userId,
    });

    await reply.send({
      message: 'Joined room successfully',
      roomMember: result.roomMember,
    });
  }

  async leave(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.userId;
    const params = roomCodeParamSchema.parse(request.params);

    const roomRepository = new DrizzleRoomRepository(request.server.db);
    const roomMemberRepository = new DrizzleRoomMemberRepository(request.server.db);

    const room = await roomRepository.findByCode(params.code);
    if (!room) {
      throw new RoomNotFoundError(params.code);
    }

    const useCase = new LeaveRoomUseCase(roomRepository, roomMemberRepository);
    const result = await useCase.execute({
      roomId: room.id,
      userId,
    });

    if (!result.success) {
      throw new NotRoomMemberError(userId, room.id);
    }

    await reply.send({
      message: 'Left room successfully',
      success: true,
    });
  }
}
