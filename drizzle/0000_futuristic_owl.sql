CREATE TABLE `bites` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`detik` real NOT NULL,
	`hasil` text NOT NULL,
	`dikoreksi` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `bites_session` ON `bites` (`session_id`);--> statement-breakpoint
CREATE TABLE `children` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text,
	`panggilan` text NOT NULL,
	`tanggal_lahir` text NOT NULL,
	`kode_akses_hash` text NOT NULL,
	`sapaan` text NOT NULL,
	`nama_pengasuh` text NOT NULL,
	`plan` text NOT NULL,
	`trial_until` text,
	`program_since` text,
	`stage` integer NOT NULL,
	`data_contoh` integer DEFAULT false NOT NULL,
	`dibuat` text NOT NULL,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `children_kode_akses_hash_unique` ON `children` (`kode_akses_hash`);--> statement-breakpoint
CREATE TABLE `clinics` (
	`id` text PRIMARY KEY NOT NULL,
	`nama` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `doctors` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text NOT NULL,
	`nama` text NOT NULL,
	`email` text NOT NULL,
	`sandi_hash` text NOT NULL,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `doctors_email_unique` ON `doctors` (`email`);--> statement-breakpoint
CREATE TABLE `food_exposures` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`makanan` text NOT NULL,
	`jumlah` integer NOT NULL,
	`terakhir` text NOT NULL,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `food_exposure_child_food` ON `food_exposures` (`child_id`,`makanan`);--> statement-breakpoint
CREATE TABLE `llm_cache` (
	`kunci` text PRIMARY KEY NOT NULL,
	`jenis` text NOT NULL,
	`hasil_json` text NOT NULL,
	`dibuat` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rules` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`source` text NOT NULL,
	`source_text` text,
	`rules_json` text NOT NULL,
	`stage` integer NOT NULL,
	`confirmed_at` text NOT NULL,
	`doctor_id` text,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `rules_child_confirmed` ON `rules` (`child_id`,`confirmed_at`);--> statement-breakpoint
CREATE TABLE `screenings` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`jawaban_json` text NOT NULL,
	`ada_tanda_bahaya` integer NOT NULL,
	`tanggal` text NOT NULL,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session_notes` (
	`session_id` text PRIMARY KEY NOT NULL,
	`porsi` text NOT NULL,
	`mood` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`stage` integer NOT NULL,
	`menu` text NOT NULL,
	`makanan_baru` integer NOT NULL,
	`mulai` text NOT NULL,
	`selesai` text NOT NULL,
	`durasi_detik` integer NOT NULL,
	`alasan_selesai` text NOT NULL,
	`diterima` integer NOT NULL,
	`ditolak` integer NOT NULL,
	`ngemut` integer NOT NULL,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_child_mulai` ON `sessions` (`child_id`,`mulai`);--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_child_start` ON `sessions` (`child_id`,`mulai`,`selesai`);--> statement-breakpoint
CREATE TABLE `shared_reports` (
	`token` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`dibuat` text NOT NULL,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `weekly_summaries` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`minggu` text NOT NULL,
	`keluarga` text NOT NULL,
	`dokter` text NOT NULL,
	`sumber` text NOT NULL,
	`model` text,
	`dibuat` text NOT NULL,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `summary_child_week` ON `weekly_summaries` (`child_id`,`minggu`);