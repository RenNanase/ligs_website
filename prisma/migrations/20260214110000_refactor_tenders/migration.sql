-- AlterTable: add pdfUrl, remove referenceNo and publishDate
ALTER TABLE `Tender` ADD COLUMN `pdfUrl` VARCHAR(500) NOT NULL DEFAULT '';
ALTER TABLE `Tender` DROP COLUMN `referenceNo`;
ALTER TABLE `Tender` DROP COLUMN `publishDate`;
