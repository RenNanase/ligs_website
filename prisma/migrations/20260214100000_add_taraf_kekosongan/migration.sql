-- AlterTable
ALTER TABLE `JawatanKosong` ADD COLUMN `taraf` VARCHAR(50) NOT NULL DEFAULT 'Kontrak',
    ADD COLUMN `kekosongan` INTEGER NOT NULL DEFAULT 1;
