-- CreateTable (SiteSettings was missing from init; add it before first ALTER)
CREATE TABLE IF NOT EXISTS `SiteSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `themeId` VARCHAR(50) NOT NULL DEFAULT 'default',
    `cartaOrganisasiImage` VARCHAR(500) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `SiteSettings` ADD COLUMN `integritiVideoUrl` VARCHAR(500) NULL;

-- CreateTable
CREATE TABLE `IntegritiImage` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
