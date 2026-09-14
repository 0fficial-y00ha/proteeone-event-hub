import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const eventPlans=sqliteTable('event_plans',{id:text('id').primaryKey(),owner:text('owner').notNull(),title:text('title').notNull(),channel:text('channel').notNull(),payload:text('payload').notNull(),version:integer('version').notNull(),updatedAt:text('updated_at').notNull()},t=>[index('idx_event_owner_updated').on(t.owner,t.updatedAt)]);
export const sourceSheets=sqliteTable('source_sheets',{id:text('id').primaryKey(),payload:text('payload').notNull()});
