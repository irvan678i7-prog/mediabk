import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const users = sqliteTable('users',{id:text('id').primaryKey(),email:text('email').notNull(),name:text('name').notNull(),role:text('role').notNull().default('user'),until:integer('until').notNull().default(0),blocked:integer('blocked').notNull().default(0)});
export const settings = sqliteTable('settings',{id:integer('id').primaryKey(),price:integer('price').notNull().default(0),bank:text('bank').notNull().default(''),account:text('account').notNull().default(''),holder:text('holder').notNull().default(''),adminId:text('admin_id')});
export const payments = sqliteTable('payments',{id:text('id').primaryKey(),userId:text('user_id').notNull(),amount:integer('amount').notNull(),sender:text('sender').notNull(),reference:text('reference').notNull(),status:text('status').notNull().default('pending'),created:integer('created').notNull(),reviewed:integer('reviewed'),reviewer:text('reviewer')});

export const teachers = sqliteTable("teachers",{email:text("email").primaryKey(),name:text("name").notNull(),school:text("school").notNull().default(""),grade:text("grade").notNull()});

export const googleIdentities=sqliteTable('google_identities',{subject:text('subject').primaryKey(),userId:text('user_id').notNull()});
export const authSessions=sqliteTable('auth_sessions',{tokenHash:text('token_hash').primaryKey(),userId:text('user_id').notNull(),expiresAt:integer('expires_at').notNull()});
export const authChallenges=sqliteTable('auth_challenges',{tokenHash:text('token_hash').primaryKey(),nonce:text('nonce').notNull(),expiresAt:integer('expires_at').notNull()});
