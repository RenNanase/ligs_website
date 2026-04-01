-- AlterTable: add status (open/closed) to Tender
ALTER TABLE `Tender` ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'open' AFTER `pdfUrl`;
