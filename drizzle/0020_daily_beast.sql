PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_attributes` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`name` text NOT NULL,
	`position` integer NOT NULL,
	`description` text NOT NULL,
	`setting` text,
	`value_type` text NOT NULL,
	`layout_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`layout_id`) REFERENCES `layouts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_attributes`("id", "label", "name", "position", "description", "setting", "value_type", "layout_id", "created_at", "updated_at") SELECT "id", "label", "name", "position", "description", "setting", "value_type", "layout_id", "created_at", "updated_at" FROM `attributes`;--> statement-breakpoint
DROP TABLE `attributes`;--> statement-breakpoint
ALTER TABLE `__new_attributes` RENAME TO `attributes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `attributes_layout_id_name_unique` ON `attributes` (`layout_id`,`name`);