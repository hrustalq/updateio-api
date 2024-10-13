/*
  Warnings:

  - Added the required column `appId` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerId` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "games" ADD COLUMN     "appId" TEXT NOT NULL,
ADD COLUMN     "providerId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "providerId" TEXT,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "appId" TEXT,

    CONSTRAINT "GameProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameProvider_appId_key" ON "GameProvider"("appId");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "GameProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameProvider" ADD CONSTRAINT "GameProvider_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE SET NULL ON UPDATE CASCADE;
