CREATE TABLE `teachers` (
	`email` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`school` text DEFAULT '' NOT NULL,
	`grade` text NOT NULL
);
