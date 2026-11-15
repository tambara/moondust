ALTER TABLE `attributes` ADD `name` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `attributes_layout_id_name_unique` ON `attributes` (`layout_id`,`name`);