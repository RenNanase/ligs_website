-- AlterTable: Add youtubeUrls JSON column and migrate data from youtubeUrl
ALTER TABLE `MediaSosial` ADD COLUMN `youtubeUrls` JSON NULL;

-- Migrate: Copy existing youtubeUrl to youtubeUrls array if present
UPDATE `MediaSosial` SET `youtubeUrls` = JSON_ARRAY(`youtubeUrl`) WHERE `youtubeUrl` IS NOT NULL AND `youtubeUrl` != '';

-- Drop old column
ALTER TABLE `MediaSosial` DROP COLUMN `youtubeUrl`;
