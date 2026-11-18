CREATE TABLE `routes` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text NOT NULL,
	`name` text NOT NULL,
	`page_id` text NOT NULL
);
--> statement-breakpoint
DROP TABLE `directory_entries`;--> statement-breakpoint
DROP TABLE `index_nodes`;