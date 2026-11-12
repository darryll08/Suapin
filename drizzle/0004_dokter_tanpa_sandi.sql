DROP INDEX `doctors_email_unique`;--> statement-breakpoint
ALTER TABLE `doctors` DROP COLUMN `email`;--> statement-breakpoint
ALTER TABLE `doctors` DROP COLUMN `sandi_hash`;