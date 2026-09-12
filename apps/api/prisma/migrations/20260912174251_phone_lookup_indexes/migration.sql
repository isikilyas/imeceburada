-- CreateIndex
CREATE INDEX "candidate_profiles_phone_idx" ON "candidate_profiles"("phone");

-- CreateIndex
CREATE INDEX "company_profiles_phone_idx" ON "company_profiles"("phone");

-- CreateIndex
CREATE INDEX "supplier_profiles_phone_idx" ON "supplier_profiles"("phone");

-- CreateIndex
CREATE INDEX "subcontractor_profiles_phone_idx" ON "subcontractor_profiles"("phone");
