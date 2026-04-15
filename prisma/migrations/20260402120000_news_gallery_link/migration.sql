-- Optional link from berita (news) to a gallery event
ALTER TABLE `NewsArticle` ADD COLUMN `galleryEventId` VARCHAR(191) NULL;
CREATE INDEX `NewsArticle_galleryEventId_idx` ON `NewsArticle`(`galleryEventId`);
ALTER TABLE `NewsArticle` ADD CONSTRAINT `NewsArticle_galleryEventId_fkey` FOREIGN KEY (`galleryEventId`) REFERENCES `GalleryEvent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
