PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_session_notes` (
	`session_id` text PRIMARY KEY NOT NULL,
	`porsi` text,
	`mood` text,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_session_notes`("session_id", "porsi", "mood") SELECT "session_id", "porsi", "mood" FROM `session_notes`;--> statement-breakpoint
DROP TABLE `session_notes`;--> statement-breakpoint
ALTER TABLE `__new_session_notes` RENAME TO `session_notes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;