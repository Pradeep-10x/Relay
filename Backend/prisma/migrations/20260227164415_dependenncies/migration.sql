/*
  Warnings:

  - You are about to drop the column `stateid` on the `Issue` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `Issue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Issue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stateId` to the `Issue` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_stateid_fkey";

-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "stateid",
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "stateId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "IssueDependency" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,

    CONSTRAINT "IssueDependency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IssueDependency_blockerId_blockedId_key" ON "IssueDependency"("blockerId", "blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_key_key" ON "Issue"("key");

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "WorkflowState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueDependency" ADD CONSTRAINT "IssueDependency_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueDependency" ADD CONSTRAINT "IssueDependency_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
