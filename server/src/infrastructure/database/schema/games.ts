import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  coverUrl: text('cover_url').notNull(),
  minPlayers: integer('min_players').notNull().default(2),
  maxPlayers: integer('max_players').notNull().default(5),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type GameRow = typeof games.$inferSelect
export type NewGameRow = typeof games.$inferInsert
