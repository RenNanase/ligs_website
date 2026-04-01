-- Fix: Remove orphaned PasswordResetToken rows (userId references deleted users)
-- Run this before: npx prisma db push
-- MySQL syntax:
DELETE ptr FROM PasswordResetToken ptr
LEFT JOIN `User` u ON ptr.userId = u.id
WHERE u.id IS NULL;
