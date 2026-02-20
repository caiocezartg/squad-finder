import { sql } from 'drizzle-orm'
import { pgTable, uuid, varchar, timestamp, integer, pgEnum, text } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { games } from './games'

export const roomStatusEnum = pgEnum('room_status', ['waiting', 'playing', 'finished'])

export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 6 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  hostId: text('host_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  gameId: uuid('game_id')
    .notNull()
    .references(() => games.id, { onDelete: 'restrict' }),
  status: roomStatusEnum('status').notNull().default('waiting'),
  maxPlayers: integer('max_players').notNull().default(5),
  discordLink: text('discord_link'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  readyNotifiedAt: timestamp('ready_notified_at', { withTimezone: true }),
  tags: text('tags').array().notNull().default(sql`ARRAY[]::text[]`),
  language: varchar('language', { length: 5 }).notNull().default('pt-br'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type RoomRow = typeof rooms.$inferSelect
export type NewRoomRow = typeof rooms.$inferInsert
