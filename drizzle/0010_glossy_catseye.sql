CREATE TABLE `attribute_values` (
	`id` text PRIMARY KEY NOT NULL,
	`attribute_id` text NOT NULL,
	`record_id` text NOT NULL,
	`value_text` text,
	`value_integer` integer,
	`value_real` real,
	`value_blob` blob,
	`value_json` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`attribute_id`) REFERENCES `attributes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attribute_values_page_attribute_unique` ON `attribute_values` (`record_id`,`attribute_id`);--> statement-breakpoint
CREATE TABLE `attributes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`value_type` text NOT NULL,
	`render_type` text NOT NULL,
	`layout_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`layout_id`) REFERENCES `layouts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attributes_name_unique` ON `attributes` (`name`);