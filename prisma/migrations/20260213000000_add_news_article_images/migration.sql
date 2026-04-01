-- CreateTable
CREATE TABLE `NewsArticleImage` (
    `id` VARCHAR(191) NOT NULL,
    `articleId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migrate existing image data to NewsArticleImage
INSERT INTO `NewsArticleImage` (`id`, `articleId`, `url`, `sortOrder`)
SELECT
    CONCAT('img_', `id`, '_', UNIX_TIMESTAMP()),
    `id`,
    `image`,
    0
FROM `NewsArticle`
WHERE `image` IS NOT NULL AND `image` != '';

-- AlterTable: Remove image column from NewsArticle
ALTER TABLE `NewsArticle` DROP COLUMN `image`;

-- AddForeignKey
ALTER TABLE `NewsArticleImage` ADD CONSTRAINT `NewsArticleImage_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `NewsArticle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
