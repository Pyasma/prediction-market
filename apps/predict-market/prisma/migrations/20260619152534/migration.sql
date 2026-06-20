/*
  Warnings:

  - A unique constraint covering the columns `[userID,marketID,type]` on the table `Position` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `qty` to the `Position` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "qty" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Position_userID_marketID_type_key" ON "Position"("userID", "marketID", "type");
