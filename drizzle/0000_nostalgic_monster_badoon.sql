CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`amount` integer NOT NULL,
	`sender` text NOT NULL,
	`reference` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created` integer NOT NULL,
	`reviewed` integer,
	`reviewer` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`price` integer DEFAULT 0 NOT NULL,
	`bank` text DEFAULT '' NOT NULL,
	`account` text DEFAULT '' NOT NULL,
	`holder` text DEFAULT '' NOT NULL,
	`admin_id` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`until` integer DEFAULT 0 NOT NULL,
	`blocked` integer DEFAULT 0 NOT NULL
);
