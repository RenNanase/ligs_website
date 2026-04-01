-- CreateTable
CREATE TABLE `EPekeliling` (
    `id` VARCHAR(191) NOT NULL,
    `noPekeliling` VARCHAR(100) NOT NULL,
    `noRujukan` VARCHAR(100) NOT NULL,
    `tajuk` VARCHAR(500) NOT NULL,
    `tarikhDikeluarkan` VARCHAR(20) NOT NULL,
    `pdfUrl` VARCHAR(500) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `EPekeliling_tarikhDikeluarkan_idx` ON `EPekeliling`(`tarikhDikeluarkan`);
