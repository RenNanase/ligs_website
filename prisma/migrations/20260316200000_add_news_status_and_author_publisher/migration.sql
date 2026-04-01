-- Add status column to NewsArticle (draft | published)
ALTER TABLE `NewsArticle` ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'published';

-- Set existing articles to published (they were already visible)
-- Default above is 'published' so no UPDATE needed for existing rows

-- Add index for status
CREATE INDEX `NewsArticle_status_idx` ON `NewsArticle`(`status`);
