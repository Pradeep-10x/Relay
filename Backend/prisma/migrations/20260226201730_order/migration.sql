/*
  Warnings:

  - Added the required column `order` to the `WorkflowState` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "issueCounter" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "WorkflowState" ADD COLUMN     "order" INTEGER NOT NULL;
