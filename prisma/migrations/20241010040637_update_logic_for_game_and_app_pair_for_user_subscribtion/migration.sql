/*
  Warnings:

  - You are about to drop the `_AppToGame` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GameToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AppToGame" DROP CONSTRAINT "_AppToGame_A_fkey";

-- DropForeignKey
ALTER TABLE "_AppToGame" DROP CONSTRAINT "_AppToGame_B_fkey";

-- DropForeignKey
ALTER TABLE "_GameToUser" DROP CONSTRAINT "_GameToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_GameToUser" DROP CONSTRAINT "_GameToUser_B_fkey";

-- DropTable
DROP TABLE "_AppToGame";

-- DropTable
DROP TABLE "_GameToUser";

-- CreateTable
CREATE TABLE "game_and_app_pair" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,

    CONSTRAINT "game_and_app_pair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscribtions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "gameOnAppId" TEXT NOT NULL,
    "isSubscribed" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_subscribtions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_and_app_pair_gameId_appId_key" ON "game_and_app_pair"("gameId", "appId");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscribtions_userId_gameId_gameOnAppId_key" ON "user_subscribtions"("userId", "gameId", "gameOnAppId");

-- AddForeignKey
ALTER TABLE "game_and_app_pair" ADD CONSTRAINT "game_and_app_pair_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_and_app_pair" ADD CONSTRAINT "game_and_app_pair_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscribtions" ADD CONSTRAINT "user_subscribtions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscribtions" ADD CONSTRAINT "user_subscribtions_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscribtions" ADD CONSTRAINT "user_subscribtions_gameOnAppId_fkey" FOREIGN KEY ("gameOnAppId") REFERENCES "game_and_app_pair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
