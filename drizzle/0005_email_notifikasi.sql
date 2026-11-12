CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`jenis` text NOT NULL,
	`kunci` text NOT NULL,
	`judul` text NOT NULL,
	`isi` text NOT NULL,
	`tautan` text NOT NULL,
	`dibuat` text NOT NULL,
	`dibaca` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notifications_child_jenis_kunci` ON `notifications` (`child_id`,`jenis`,`kunci`);--> statement-breakpoint
CREATE INDEX `notifications_child_dibuat` ON `notifications` (`child_id`,`dibuat`);--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`endpoint` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`dibuat` text NOT NULL,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `push_child` ON `push_subscriptions` (`child_id`);--> statement-breakpoint
ALTER TABLE `children` ADD `email` text;--> statement-breakpoint
ALTER TABLE `children` ADD `sandi_hash` text;--> statement-breakpoint
CREATE UNIQUE INDEX `children_email_unique` ON `children` (`email`);--> statement-breakpoint
ALTER TABLE `doctors` ADD `email` text;--> statement-breakpoint
ALTER TABLE `doctors` ADD `sandi_hash` text;--> statement-breakpoint
CREATE UNIQUE INDEX `doctors_email_unique` ON `doctors` (`email`);