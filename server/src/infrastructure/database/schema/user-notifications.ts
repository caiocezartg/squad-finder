import { pgTable, uuid, text, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { user } from './auth'

export const userNotifications = pgTable('user_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 160 }).notNull(),
  message: text('message').notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default({}),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type UserNotificationRow = typeof userNotifications.$inferSelect
export type NewUserNotificationRow = typeof userNotifications.$inferInsert
