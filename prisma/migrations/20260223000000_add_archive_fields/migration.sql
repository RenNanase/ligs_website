-- AlterTable
ALTER TABLE `NewsArticle` ADD COLUMN `isArchived` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `NewsArticle` ADD COLUMN `archivedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `GalleryEvent` ADD COLUMN `isArchived` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `GalleryEvent` ADD COLUMN `archivedAt` DATETIME(3) NULL;
