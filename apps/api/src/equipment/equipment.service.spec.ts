import { EquipmentService } from "./equipment.service";

describe("EquipmentService.toDto", () => {
  const service = new EquipmentService({} as never);

  const baseListing = {
    id: "eq-1",
    ownerId: "owner-1",
    equipmentType: "FORKLIFT",
    capacity: null,
    city: "İzmir",
    district: null,
    listingType: "SALE",
    dailyRate: null,
    hourlyRate: null,
    salePrice: 100000,
    photoUrl: null,
    description: "Açıklama",
    status: "AVAILABLE",
    createdAt: new Date("2026-01-01T00:00:00Z"),
  };

  function callToDto(owner: unknown) {
    return (service as unknown as { toDto: (l: unknown) => { ownerVerified: boolean } }).toDto({
      ...baseListing,
      owner,
    });
  }

  it("marks a company-owned listing as verified when the company phone is confirmed", () => {
    const dto = callToDto({
      candidateProfile: null,
      companyProfile: { companyName: "Test A.Ş.", phone: "+905550000000", phoneVerifiedAt: new Date() },
    });

    expect(dto.ownerVerified).toBe(true);
  });

  it("marks the listing as unverified when the owning company has no confirmed phone", () => {
    const dto = callToDto({
      candidateProfile: null,
      companyProfile: { companyName: "Test A.Ş.", phone: "+905550000000", phoneVerifiedAt: null },
    });

    expect(dto.ownerVerified).toBe(false);
  });

  it("marks a candidate-owned listing as unverified — candidates have no phone verification", () => {
    const dto = callToDto({
      candidateProfile: { fullName: "Ali Usta", phone: "+905550000000" },
      companyProfile: null,
    });

    expect(dto.ownerVerified).toBe(false);
  });
});
