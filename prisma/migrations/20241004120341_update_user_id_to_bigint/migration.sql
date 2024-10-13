/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `telegram_users` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `userId` on the `profiles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `user_subscriptions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_bot` to the `users` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_subscriptions" DROP CONSTRAINT "user_subscriptions_userId_fkey";

-- DropIndex
DROP INDEX "users_email_key";

-- DropIndex
DROP INDEX "users_passwordHash_key";

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "userId",
ADD COLUMN     "userId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "user_subscriptions" DROP COLUMN "userId",
ADD COLUMN     "userId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "email",
ADD COLUMN     "added_to_attachment_menu" BOOLEAN,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "is_bot" BOOLEAN NOT NULL,
ADD COLUMN     "is_premium" BOOLEAN,
ADD COLUMN     "language_code" TEXT,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "username" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" BIGINT NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "telegram_users";

-- DropEnum
DROP TYPE "TelegramUserRole";

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_userId_gameId_key" ON "user_subscriptions"("userId", "gameId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
