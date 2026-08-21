CREATE TABLE `maintenanceCycles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cycleNumber` int NOT NULL,
	`status` enum('started','completed') NOT NULL,
	`resultStatus` enum('success','blocked','error'),
	`summary` text,
	`repositoriesChecked` int,
	`failedRepositories` int,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `maintenanceCycles_id` PRIMARY KEY(`id`),
	CONSTRAINT `maintenanceCycles_cycleNumber_unique` UNIQUE(`cycleNumber`)
);
