CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`doctor_id` text NOT NULL,
	`waktu` text NOT NULL,
	`jenis` text NOT NULL,
	`status` text NOT NULL,
	`catatan` text,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `appointments_doctor_waktu` ON `appointments` (`doctor_id`,`waktu`);--> statement-breakpoint
CREATE INDEX `appointments_child` ON `appointments` (`child_id`);--> statement-breakpoint
ALTER TABLE `children` ADD `doctor_id` text REFERENCES doctors(id);--> statement-breakpoint
ALTER TABLE `clinics` ADD `kota` text;--> statement-breakpoint
ALTER TABLE `clinics` ADD `email` text;--> statement-breakpoint
ALTER TABLE `clinics` ADD `sandi_hash` text;--> statement-breakpoint
CREATE UNIQUE INDEX `clinics_email_unique` ON `clinics` (`email`);--> statement-breakpoint
ALTER TABLE `doctors` ADD `spesialis` text;--> statement-breakpoint
ALTER TABLE `doctors` ADD `kode_akses_hash` text;--> statement-breakpoint
CREATE UNIQUE INDEX `doctors_kode_akses_hash_unique` ON `doctors` (`kode_akses_hash`);