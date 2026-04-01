-- Add survey form open/close toggles to SiteSettings
ALTER TABLE `SiteSettings` ADD COLUMN `kepuasanPelangganOpen` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `SiteSettings` ADD COLUMN `kepuasanStafOpen` BOOLEAN NOT NULL DEFAULT true;
