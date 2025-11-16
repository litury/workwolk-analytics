/*
  Warnings:

  - Made the column `hh_user_id` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "telegram_id" DROP NOT NULL,
ALTER COLUMN "hh_user_id" SET NOT NULL;
