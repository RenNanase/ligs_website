-- CreateTable
CREATE TABLE `MediaSosial` (
    `id` VARCHAR(191) NOT NULL,
    `youtubeUrl` VARCHAR(500) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert singleton row
INSERT INTO `MediaSosial` (`id`, `youtubeUrl`, `updatedAt`) VALUES ('singleton', NULL, CURRENT_TIMESTAMP(3));
