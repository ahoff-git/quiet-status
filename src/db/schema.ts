import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const statuses = pgTable('statuses', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
});
