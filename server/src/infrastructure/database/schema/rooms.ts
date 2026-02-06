import { pgTable, uuid, varchar, timestamp, boolean, integer, pgEnum, text } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const roomStatusEnum = pgEnum('room_status', ['waiting', 'playing', 'finished']);

export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 6 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  hostId: text('host_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  status: roomStatusEnum('status').notNull().default('waiting'),
  maxPlayers: integer('max_players').notNull().default(10),
  isPrivate: boolean('is_private').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type RoomRow = typeof rooms.$inferSelect;
export type NewRoomRow = typeof rooms.$inferInsert;
