/*
  Warnings:

  - You are about to drop the column `appId` on the `games` table. All the data in the column will be lost.
  - You are about to drop the `game_updates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_subscriptions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `appId` to the `patch_notes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "game_updates" DROP CONSTRAINT "game_updates_gameId_fkey";

-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_appId_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_subscriptions" DROP CONSTRAINT "user_subscriptions_gameId_fkey";

-- DropForeignKey
ALTER TABLE "user_subscriptions" DROP CONSTRAINT "user_subscriptions_userId_fkey";

-- AlterTable
ALTER TABLE "App" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "games" DROP COLUMN "appId",
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "patch_notes" ADD COLUMN     "appId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "allows_write_to_pm" BOOLEAN DEFAULT true;

-- DropTable
DROP TABLE "game_updates";

-- DropTable
DROP TABLE "profiles";

-- DropTable
DROP TABLE "user_subscriptions";

-- CreateTable
CREATE TABLE "_AppToGame" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_GameToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AppToGame_AB_unique" ON "_AppToGame"("A", "B");

-- CreateIndex
CREATE INDEX "_AppToGame_B_index" ON "_AppToGame"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToUser_AB_unique" ON "_GameToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToUser_B_index" ON "_GameToUser"("B");

-- AddForeignKey
ALTER TABLE "patch_notes" ADD CONSTRAINT "patch_notes_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppToGame" ADD CONSTRAINT "_AppToGame_A_fkey" FOREIGN KEY ("A") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppToGame" ADD CONSTRAINT "_AppToGame_B_fkey" FOREIGN KEY ("B") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToUser" ADD CONSTRAINT "_GameToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToUser" ADD CONSTRAINT "_GameToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
