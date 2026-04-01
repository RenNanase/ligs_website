CREATE TABLE IF NOT EXISTS `AkalSubmission` (
  `id` VARCHAR(191) NOT NULL,
  `namaParent` VARCHAR(255) NOT NULL,
  `noMykadParent` VARCHAR(30) NOT NULL,
  `unitBahagian` VARCHAR(255) NULL,
  `noSpkns` VARCHAR(100) NULL,
  `alamatRumah` TEXT NOT NULL,
  `noTel` VARCHAR(50) NOT NULL,
  `namaAnak` VARCHAR(255) NOT NULL,
  `noMykadAnak` VARCHAR(30) NOT NULL,
  `namaSekolah` VARCHAR(500) NOT NULL,
  `namaPeperiksaan` VARCHAR(100) NOT NULL,
  `tahunPeperiksaan` VARCHAR(20) NOT NULL,
  `noAngkaGiliran` VARCHAR(50) NOT NULL,
  `keputusanPeperiksaan` VARCHAR(255) NOT NULL,
  `pdfUrl` VARCHAR(500) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
