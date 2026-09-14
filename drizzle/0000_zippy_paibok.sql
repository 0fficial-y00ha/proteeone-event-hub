CREATE TABLE `event_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`channel` text NOT NULL,
	`payload` text NOT NULL,
	`version` integer NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_event_owner_updated` ON `event_plans` (`owner`,`updated_at`);--> statement-breakpoint
CREATE TABLE `source_sheets` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL
);
