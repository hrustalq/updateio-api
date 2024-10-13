/*
  Warnings:

  - You are about to drop the `user_subscribtions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_subscribtions" DROP CONSTRAINT "user_subscribtions_gameId_fkey";

-- DropForeignKey
ALTER TABLE "user_subscribtions" DROP CONSTRAINT "user_subscribtions_gameOnAppId_fkey";

-- DropForeignKey
ALTER TABLE "user_subscribtions" DROP CONSTRAINT "user_subscribtions_userId_fkey";

-- DropTable
DROP TABLE "user_subscribtions";

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "isSubscribed" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_userId_gameId_appId_key" ON "user_subscriptions"("userId", "gameId", "appId");

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
