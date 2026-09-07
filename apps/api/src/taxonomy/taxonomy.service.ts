import { Injectable } from "@nestjs/common";
import {
  COMPANY_NAME_SUGGESTION_LIMIT,
  COMPANY_NAME_SUGGESTION_THRESHOLD,
  CompanyNameSuggestion,
  EQUIPMENT_TYPES,
  MATERIAL_CATEGORY_ITEMS,
  MATERIAL_TYPES,
  normalizeForMatch,
  stringSimilarity,
  TAXONOMY_SUGGESTION_LIMIT,
  TAXONOMY_SUGGESTION_THRESHOLD,
  TaxonomySuggestResponse,
  TaxonomySuggestion,
  TaxonomyTermStatus,
  TaxonomyTermType,
  TRADE_CATEGORIES,
  UserRole,
} from "@imeceburada/shared";
import { PrismaService } from "../prisma/prisma.service";

interface CanonicalTerm {
  value: string;
  label: string;
}

const CANONICAL_TERMS: Record<TaxonomyTermType, CanonicalTerm[]> = {
  TRADE_PROFESSION: TRADE_CATEGORIES,
  MATERIAL_TYPE: MATERIAL_TYPES,
  MATERIAL_CATEGORY_ITEM: MATERIAL_CATEGORY_ITEMS,
  EQUIPMENT_TYPE: EQUIPMENT_TYPES,
};

@Injectable()
export class TaxonomyService {
  constructor(private prisma: PrismaService) {}

  /** Live "did you mean X?" lookup — merges the static canonical list with community-approved terms. */
  async suggest(type: TaxonomyTermType, query: string): Promise<TaxonomySuggestResponse> {
    const normalizedQuery = normalizeForMatch(query);
    const canonical = CANONICAL_TERMS[type];
    const approved = await this.prisma.taxonomyTerm.findMany({
      where: { type, status: "APPROVED" },
      select: { value: true, label: true },
    });

    const isExact = (t: CanonicalTerm) =>
      normalizeForMatch(t.value) === normalizedQuery || normalizeForMatch(t.label) === normalizedQuery;
    const exactMatch = canonical.some(isExact) || approved.some(isExact);

    const scored: TaxonomySuggestion[] = [];
    for (const t of canonical) {
      const similarity = stringSimilarity(query, t.label);
      if (similarity >= TAXONOMY_SUGGESTION_THRESHOLD) scored.push({ ...t, source: "canonical", similarity });
    }
    for (const t of approved) {
      const similarity = stringSimilarity(query, t.label);
      if (similarity >= TAXONOMY_SUGGESTION_THRESHOLD) scored.push({ ...t, source: "community", similarity });
    }
    scored.sort((a, b) => b.similarity - a.similarity);

    return { query, exactMatch, suggestions: scored.slice(0, TAXONOMY_SUGGESTION_LIMIT) };
  }

  /** Bulk helper for array fields (e.g. tradeCategories[], supplyCategories[]). */
  async resolveOrQueueTerms(type: TaxonomyTermType, rawValues: string[], userId: string | null): Promise<string[]> {
    const resolved: string[] = [];
    for (const rawValue of rawValues) resolved.push(await this.resolveOrQueueTerm(type, rawValue, userId));
    return resolved;
  }

  /**
   * Called at the moment an entity is actually created/updated. Never blocks: if the
   * value doesn't match anything canonical/known, it's queued as PENDING for admin
   * review, but the caller's raw text is returned immediately and used right away.
   * `userId` is null for registration flows, where the term is resolved before the
   * new user row (and thus its id) exists yet.
   */
  async resolveOrQueueTerm(type: TaxonomyTermType, rawValue: string, userId: string | null): Promise<string> {
    const value = rawValue.trim().replace(/\s+/g, " ");
    const normalizedValue = normalizeForMatch(value);

    const canonicalMatch = CANONICAL_TERMS[type].find(
      (t) => normalizeForMatch(t.value) === normalizedValue || normalizeForMatch(t.label) === normalizedValue,
    );
    if (canonicalMatch) return canonicalMatch.value;

    const existing = await this.prisma.taxonomyTerm.findUnique({
      where: { type_normalizedValue: { type, normalizedValue } },
    });
    if (existing) return existing.status === "REJECTED" ? value : existing.value;

    await this.prisma.taxonomyTerm.create({
      data: { type, value, normalizedValue, label: value, submittedByUserId: userId },
    });
    return value;
  }

  /** Purely informational — never blocks, no moderation queue (every company is inherently new). */
  async findSimilarCompanyNames(name: string): Promise<CompanyNameSuggestion[]> {
    const [companies, suppliers, subcontractors] = await Promise.all([
      this.prisma.companyProfile.findMany({ select: { companyName: true } }),
      this.prisma.supplierProfile.findMany({ select: { companyName: true } }),
      this.prisma.subcontractorProfile.findMany({ select: { companyName: true } }),
    ]);

    const candidates: { name: string; role: UserRole }[] = [
      ...companies.map((c) => ({ name: c.companyName, role: "COMPANY" as const })),
      ...suppliers.map((c) => ({ name: c.companyName, role: "SUPPLIER" as const })),
      ...subcontractors.map((c) => ({ name: c.companyName, role: "SUBCONTRACTOR" as const })),
    ];

    const scored: CompanyNameSuggestion[] = [];
    for (const c of candidates) {
      const similarity = stringSimilarity(name, c.name);
      if (similarity >= COMPANY_NAME_SUGGESTION_THRESHOLD) scored.push({ ...c, similarity });
    }
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, COMPANY_NAME_SUGGESTION_LIMIT);
  }

  // --- admin moderation ---

  listTerms(status?: TaxonomyTermStatus, type?: TaxonomyTermType) {
    return this.prisma.taxonomyTerm.findMany({
      where: { ...(status ? { status } : {}), ...(type ? { type } : {}) },
      orderBy: { createdAt: "asc" },
    });
  }

  approveTerm(id: string, adminId: string, labelOverride?: string) {
    return this.prisma.taxonomyTerm.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedByUserId: adminId,
        reviewedAt: new Date(),
        ...(labelOverride ? { label: labelOverride } : {}),
      },
    });
  }

  rejectTerm(id: string, adminId: string) {
    return this.prisma.taxonomyTerm.update({
      where: { id },
      data: { status: "REJECTED", reviewedByUserId: adminId, reviewedAt: new Date() },
    });
  }
}
