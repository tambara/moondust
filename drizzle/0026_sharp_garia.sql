ALTER TABLE `pages` ADD `block` text NOT NULL;--> statement-breakpoint
ALTER TABLE `routes` ADD `slug` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `routes_parent_id_slug_unique` ON `routes` (`parent_id`,`slug`);--> statement-breakpoint
ALTER TABLE `routes` DROP COLUMN `name`;