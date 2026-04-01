-- AlterTable: add openingDate (Tarikh Buka) to Tender
ALTER TABLE `Tender` ADD COLUMN `openingDate` VARCHAR(20) NOT NULL DEFAULT '2000-01-01' AFTER `titleMs`;
