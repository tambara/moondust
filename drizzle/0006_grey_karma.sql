CREATE TABLE `html_classes` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`record_type` text NOT NULL,
	`record_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `html_classes_record_unique` ON `html_classes` (`record_type`,`record_id`);--> statement-breakpoint
CREATE TABLE `system_settings` (
	`name` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
