PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`layout_id` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`layout_id`) REFERENCES `layouts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_pages`("id", "slug", "title", "body", "layout_id", "created_at", "updated_at") SELECT "id", "slug", "title", "body", "layout_id", "created_at", "updated_at" FROM `pages`;--> statement-breakpoint
DROP TABLE `pages`;--> statement-breakpoint
ALTER TABLE `__new_pages` RENAME TO `pages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `pages_slug_unique` ON `pages` (`slug`);