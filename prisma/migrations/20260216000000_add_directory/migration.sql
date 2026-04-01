-- CreateTable
CREATE TABLE `DirectoryBahagian` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DirectoryMember` (
    `id` VARCHAR(191) NOT NULL,
    `bahagianId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `jawatan` VARCHAR(255) NOT NULL,
    `noTelefon` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `imageUrl` VARCHAR(500) NOT NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `DirectoryBahagian_orderIndex_idx` ON `DirectoryBahagian`(`orderIndex`);

-- CreateIndex
CREATE INDEX `DirectoryMember_bahagianId_idx` ON `DirectoryMember`(`bahagianId`);

-- CreateIndex
CREATE INDEX `DirectoryMember_bahagianId_orderIndex_idx` ON `DirectoryMember`(`bahagianId`, `orderIndex`);

-- AddForeignKey
ALTER TABLE `DirectoryMember` ADD CONSTRAINT `DirectoryMember_bahagianId_fkey` FOREIGN KEY (`bahagianId`) REFERENCES `DirectoryBahagian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
