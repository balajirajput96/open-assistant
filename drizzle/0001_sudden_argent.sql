CREATE TABLE `maintenanceRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` enum('success','blocked','error') NOT NULL,
	`repositoriesChecked` int NOT NULL,
	`failedRepositories` int NOT NULL,
	`summary` text NOT NULL,
	`details` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `maintenanceRuns_id` PRIMARY KEY(`id`)
);
