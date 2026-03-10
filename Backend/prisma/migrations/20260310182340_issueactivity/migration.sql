-- CreateTable
CREATE TABLE "IssueActiviy" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "fromValue" TEXT,
    "toValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueActiviy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IssueActiviy_issueId_idx" ON "IssueActiviy"("issueId");

-- AddForeignKey
ALTER TABLE "IssueActiviy" ADD CONSTRAINT "IssueActiviy_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueActiviy" ADD CONSTRAINT "IssueActiviy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
