-- CreateTable
CREATE TABLE `JawatanKosong` (
    `id` VARCHAR(191) NOT NULL,
    `jawatanName` VARCHAR(500) NOT NULL,
    `tarikhLuput` DATE NOT NULL,
    `pdfUrl` VARCHAR(500) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `JawatanKosong_tarikhLuput_idx` ON `JawatanKosong`(`tarikhLuput`);
