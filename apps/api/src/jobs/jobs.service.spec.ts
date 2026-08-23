import { JobsService } from "./jobs.service";

describe("JobsService.toDto", () => {
  const service = new JobsService({} as never, {} as never);

  const baseJob = {
    id: "job-1",
    companyId: "company-1",
    title: "Demirci Ustası",
    listingType: "PERSONNEL",
    tradeCategory: "DEMIRCI",
    city: "Bursa",
    district: null,
    employmentType: "DAILY",
    salaryMin: 1000,
    salaryMax: 1500,
    isUrgent: false,
    description: "Açıklama",
    status: "ACTIVE",
    createdAt: new Date("2026-01-01T00:00:00Z"),
  };

  it("marks the listing as verified when the company has a confirmed phone", () => {
    const dto = (service as unknown as { toDto: (j: unknown) => { companyVerified: boolean } }).toDto({
      ...baseJob,
      company: { companyName: "Test A.Ş.", phoneVerifiedAt: new Date() },
    });

    expect(dto.companyVerified).toBe(true);
  });

  it("marks the listing as unverified when the company has no confirmed phone", () => {
    const dto = (service as unknown as { toDto: (j: unknown) => { companyVerified: boolean } }).toDto({
      ...baseJob,
      company: { companyName: "Test A.Ş.", phoneVerifiedAt: null },
    });

    expect(dto.companyVerified).toBe(false);
  });
});
