-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BannerSlide` (
    `id` VARCHAR(191) NOT NULL,
    `image` VARCHAR(2000) NOT NULL DEFAULT '',
    `title` VARCHAR(255) NOT NULL,
    `titleMs` VARCHAR(255) NOT NULL,
    `caption` TEXT NOT NULL,
    `captionMs` TEXT NOT NULL,
    `ctaText` VARCHAR(255) NOT NULL,
    `ctaTextMs` VARCHAR(255) NOT NULL,
    `ctaLink` VARCHAR(255) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StatItem` (
    `id` VARCHAR(191) NOT NULL,
    `labelKey` VARCHAR(100) NOT NULL,
    `value` INTEGER NOT NULL,
    `suffix` VARCHAR(50) NOT NULL DEFAULT '',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NewsArticle` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `titleMs` VARCHAR(500) NOT NULL,
    `content` TEXT NOT NULL,
    `contentMs` TEXT NOT NULL,
    `date` VARCHAR(20) NOT NULL,
    `image` VARCHAR(2000) NOT NULL DEFAULT '',
    `category` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamMember` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) NOT NULL,
    `roleMs` VARCHAR(255) NOT NULL,
    `bio` TEXT NOT NULL,
    `bioMs` TEXT NOT NULL,
    `image` VARCHAR(2000) NOT NULL DEFAULT '',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Announcement` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `titleMs` VARCHAR(500) NOT NULL,
    `summary` TEXT NOT NULL,
    `summaryMs` TEXT NOT NULL,
    `date` VARCHAR(20) NOT NULL,
    `pinned` BOOLEAN NOT NULL DEFAULT false,
    `category` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tender` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `titleMs` VARCHAR(500) NOT NULL,
    `referenceNo` VARCHAR(50) NOT NULL,
    `closingDate` VARCHAR(20) NOT NULL,
    `publishDate` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'open',
    `category` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LandingContent` (
    `id` VARCHAR(191) NOT NULL,
    `heroTitle` VARCHAR(500) NOT NULL,
    `heroTitleMs` VARCHAR(500) NOT NULL,
    `heroSubtitle` TEXT NOT NULL,
    `heroSubtitleMs` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Highlight` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `titleMs` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `descriptionMs` TEXT NOT NULL,
    `icon` VARCHAR(50) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `landingContentId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Highlight` ADD CONSTRAINT `Highlight_landingContentId_fkey` FOREIGN KEY (`landingContentId`) REFERENCES `LandingContent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
