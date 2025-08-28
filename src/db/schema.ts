import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  displayName: text('display_name').notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  color: text('color').notNull(),
});

export const updates = pgTable('updates', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // List of user IDs allowed to view this update. Null means visible to everyone.
  reach: integer('reach').array(),
  // When set, the update is considered invalid/expired after this timestamp
  expiresAt: timestamp('expires_at'),
});

export const userStats = pgTable('user_stats', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  lastActive: timestamp('last_active'),
  updateCount: integer('update_count').notNull().default(0),
});

export const userActiveFilterSettings = pgTable('user_active_filter_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  filter: text('filter').notNull(),
});
