-- CreateIndex
CREATE INDEX "Answer_score_idx" ON "Answer"("score");

-- CreateIndex
CREATE INDEX "Answer_score_createdAt_idx" ON "Answer"("score", "createdAt");

-- CreateIndex
CREATE INDEX "Question_type_idx" ON "Question"("type");
