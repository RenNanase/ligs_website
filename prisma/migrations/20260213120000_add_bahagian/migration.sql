-- CreateTable
CREATE TABLE `Bahagian` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `shortDescription` TEXT NULL,
    `content` LONGTEXT NOT NULL,
    `featuredImage` VARCHAR(500) NULL,
    `membersImage` VARCHAR(500) NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'draft',
    `metaTitle` VARCHAR(255) NULL,
    `metaDescription` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Bahagian_slug_key`(`slug`),
    INDEX `Bahagian_slug_idx`(`slug`),
    INDEX `Bahagian_orderIndex_idx`(`orderIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
