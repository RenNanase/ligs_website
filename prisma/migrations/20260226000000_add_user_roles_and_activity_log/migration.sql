-- AlterTable
ALTER TABLE `User` ADD COLUMN `role` VARCHAR(20) NOT NULL DEFAULT 'user';
ALTER TABLE `User` ADD COLUMN `allowedModules` JSON NULL;

-- Set existing users as admin so they retain access
UPDATE `User` SET `role` = 'admin' WHERE `role` = 'user';

-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(255) NOT NULL,
    `activity` VARCHAR(500) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ActivityLog_userId_idx` ON `ActivityLog`(`userId`);
CREATE INDEX `ActivityLog_createdAt_idx` ON `ActivityLog`(`createdAt`);
