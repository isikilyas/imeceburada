import { MaterialListingsService } from "./material-listings.service";

describe("MaterialListingsService.toDto", () => {
  const service = new MaterialListingsService({} as never);

  const baseListing = {
    id: "ml-1",
    supplierId: "supplier-1",
    materialType: "CIMENTO",
    unit: "TORBA",
    city: "Bursa",
    district: null,
    price: 220,
    photoUrl: null,
    description: "Açıklama",
    status: "AVAILABLE",
    createdAt: new Date("2026-01-01T00:00:00Z"),
  };

  it("marks the listing as verified when the supplier's phone is confirmed", () => {
    const dto = (service as unknown as { toDto: (l: unknown) => { supplierVerified: boolean } }).toDto({
      ...baseListing,
      supplier: { companyName: "Tedarikçi A.Ş.", phone: "+905550000000", phoneVerifiedAt: new Date() },
    });

    expect(dto.supplierVerified).toBe(true);
  });

  it("marks the listing as unverified when the supplier has no confirmed phone", () => {
    const dto = (service as unknown as { toDto: (l: unknown) => { supplierVerified: boolean } }).toDto({
      ...baseListing,
      supplier: { companyName: "Tedarikçi A.Ş.", phone: "+905550000000", phoneVerifiedAt: null },
    });

    expect(dto.supplierVerified).toBe(false);
  });
});
