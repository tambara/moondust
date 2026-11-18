PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_routes` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text NOT NULL,
	`slug` text NOT NULL,
	`page_id` text NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `routes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_routes`("id", "parent_id", "slug", "page_id") SELECT "id", "parent_id", "slug", "page_id" FROM `routes`;--> statement-breakpoint
DROP TABLE `routes`;--> statement-breakpoint
ALTER TABLE `__new_routes` RENAME TO `routes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `routes_parent_id_slug_unique` ON `routes` (`parent_id`,`slug`);