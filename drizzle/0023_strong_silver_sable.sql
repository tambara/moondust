CREATE TABLE `directory_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text NOT NULL,
	`node_id` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`node_id`) REFERENCES `index_nodes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `index_nodes` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL
);
