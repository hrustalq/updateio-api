/*
  Warnings:

  - You are about to drop the column `providerId` on the `App` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `games` table. All the data in the column will be lost.
  - You are about to drop the `GameProvider` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `App` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "GameProvider" DROP CONSTRAINT "GameProvider_appId_fkey";

-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_providerId_fkey";

-- AlterTable
ALTER TABLE "App" DROP COLUMN "providerId";

-- AlterTable
ALTER TABLE "games" DROP COLUMN "providerId";

-- DropTable
DROP TABLE "GameProvider";

-- CreateIndex
CREATE UNIQUE INDEX "App_name_key" ON "App"("name");
