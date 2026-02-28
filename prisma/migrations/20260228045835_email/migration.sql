/*
  Warnings:

  - You are about to drop the column `googleSubId` on the `BetaUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `BetaUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `BetaUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BetaUser_googleSubId_key";

-- AlterTable
ALTER TABLE "BetaUser" DROP COLUMN "googleSubId",
ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BetaUser_email_key" ON "BetaUser"("email");
