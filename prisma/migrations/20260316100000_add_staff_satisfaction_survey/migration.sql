-- CreateTable
CREATE TABLE `StaffSatisfactionSurvey` (
    `id` VARCHAR(191) NOT NULL,
    `jantina` VARCHAR(20) NOT NULL,
    `daerah` VARCHAR(255) NOT NULL,
    `bahagianUnit` VARCHAR(255) NOT NULL,
    `tahunKhidmat` VARCHAR(50) NOT NULL,
    `q1` VARCHAR(50) NOT NULL,
    `q2` VARCHAR(50) NOT NULL,
    `q3` VARCHAR(50) NOT NULL,
    `q4` VARCHAR(50) NOT NULL,
    `q5` VARCHAR(50) NOT NULL,
    `q6` VARCHAR(50) NOT NULL,
    `q7` VARCHAR(50) NOT NULL,
    `q8` VARCHAR(50) NOT NULL,
    `cadanganKomen` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `StaffSatisfactionSurvey_createdAt_idx` ON `StaffSatisfactionSurvey`(`createdAt`);
