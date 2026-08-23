import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const MEMBER_UNTIL = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

async function main() {
  const passwordHash = await bcrypt.hash("Deneme123!", 10);

  const company = await prisma.user.upsert({
    where: { email: "demo-sirket@imeceburada.com" },
    update: {},
    create: {
      email: "demo-sirket@imeceburada.com",
      passwordHash,
      role: "COMPANY",
      companyProfile: {
        create: {
          companyName: "Demo İnşaat A.Ş.",
          sector: "Konut İnşaatı",
          city: "İstanbul",
          phone: "+905551234567",
          phoneVerifiedAt: new Date(),
          membershipStatus: "ACTIVE",
          membershipExpiresAt: MEMBER_UNTIL(),
        },
      },
    },
    include: { companyProfile: true },
  });

  const candidate = await prisma.user.upsert({
    where: { email: "demo-aday@imeceburada.com" },
    update: {},
    create: {
      email: "demo-aday@imeceburada.com",
      passwordHash,
      role: "CANDIDATE",
      candidateProfile: {
        create: {
          fullName: "Demo Aday",
          city: "İstanbul",
          experienceYears: 4,
          skills: ["Kalıp", "Betonarme"],
          primaryTradeCategory: "KALIPCI",
          isPublic: true,
          phone: "+905559876543",
        },
      },
    },
    include: { candidateProfile: true },
  });

  const supplier = await prisma.user.upsert({
    where: { email: "demo-tedarikci@imeceburada.com" },
    update: {},
    create: {
      email: "demo-tedarikci@imeceburada.com",
      passwordHash,
      role: "SUPPLIER",
      supplierProfile: {
        create: {
          companyName: "Demo Yapı Market",
          city: "Bursa",
          phone: "+905553334455",
          phoneVerifiedAt: new Date(),
          membershipStatus: "ACTIVE",
          membershipExpiresAt: MEMBER_UNTIL(),
        },
      },
    },
    include: { supplierProfile: true },
  });

  // upsert'in "update" dalı iç içe profile alanlarına dokunmadığı için,
  // seed daha önce çalıştırılmışsa yeni alanları burada ayrıca güncelliyoruz.
  if (company.companyProfile) {
    await prisma.companyProfile.update({
      where: { id: company.companyProfile.id },
      data: {
        phone: "+905551234567",
        phoneVerifiedAt: new Date(),
        membershipStatus: "ACTIVE",
        membershipExpiresAt: MEMBER_UNTIL(),
      },
    });
  }
  if (candidate.candidateProfile) {
    await prisma.candidateProfile.update({
      where: { id: candidate.candidateProfile.id },
      data: { primaryTradeCategory: "KALIPCI", isPublic: true, phone: "+905559876543" },
    });
  }
  if (supplier.supplierProfile) {
    await prisma.supplierProfile.update({
      where: { id: supplier.supplierProfile.id },
      data: {
        phone: "+905553334455",
        phoneVerifiedAt: new Date(),
        membershipStatus: "ACTIVE",
        membershipExpiresAt: MEMBER_UNTIL(),
      },
    });
    await prisma.materialListing.upsert({
      where: { id: "00000000-0000-4000-8000-000000000002" },
      update: {},
      create: {
        id: "00000000-0000-4000-8000-000000000002",
        supplierId: supplier.supplierProfile.id,
        materialType: "CIMENTO",
        unit: "TORBA",
        city: "Bursa",
        price: 220,
        description: "Toptan çimento satışı, aynı gün teslimat.",
      },
    });
  }

  if (company.companyProfile) {
    await prisma.jobPosting.upsert({
      where: { id: "00000000-0000-4000-8000-000000000001" },
      update: {},
      create: {
        id: "00000000-0000-4000-8000-000000000001",
        companyId: company.companyProfile.id,
        title: "Deneyimli Kalıpçı Aranıyor",
        tradeCategory: "KALIPCI",
        city: "İstanbul",
        employmentType: "DAILY",
        salaryMin: 1200,
        salaryMax: 1600,
        description: "Şantiyemizde çalışacak deneyimli kalıpçı ustaları aranmaktadır.",
      },
    });
  }

  if (candidate) {
    const sampleWages = [
      { tradeCategory: "KALIPCI", city: "İstanbul", experienceLevel: "MID" as const, amount: 1400, period: "DAILY" as const },
      { tradeCategory: "KALIPCI", city: "İstanbul", experienceLevel: "SENIOR" as const, amount: 1700, period: "DAILY" as const },
      { tradeCategory: "ELEKTRIKCI", city: "Ankara", experienceLevel: "JUNIOR" as const, amount: 900, period: "DAILY" as const },
    ];

    for (const wage of sampleWages) {
      await prisma.wageSubmission.create({
        data: { ...wage, submittedById: candidate.id },
      });
    }
  }

  // ── Ek demo şirketler / tedarikçiler / taşeron ────────────────────────────
  const companyDefs = [
    { email: "anadolu-yapi@imeceburada.com", name: "Anadolu Yapı Ltd.", sector: "Altyapı", city: "Ankara", phone: "+905552221100" },
    { email: "ege-insaat@imeceburada.com", name: "Ege İnşaat Grup", sector: "Ticari Yapı", city: "İzmir", phone: "+905552221101" },
    { email: "marmara-betonarme@imeceburada.com", name: "Marmara Betonarme A.Ş.", sector: "Betonarme", city: "Bursa", phone: "+905552221102" },
  ];
  const companies = [company];
  for (const def of companyDefs) {
    const u = await prisma.user.upsert({
      where: { email: def.email },
      update: {},
      create: {
        email: def.email,
        passwordHash,
        role: "COMPANY",
        companyProfile: {
          create: {
            companyName: def.name,
            sector: def.sector,
            city: def.city,
            phone: def.phone,
            phoneVerifiedAt: new Date(),
            membershipStatus: "ACTIVE",
            membershipExpiresAt: MEMBER_UNTIL(),
          },
        },
      },
      include: { companyProfile: true },
    });
    companies.push(u);
  }

  const supplierDefs = [
    { email: "akdeniz-yapi@imeceburada.com", name: "Akdeniz Yapı Market", city: "Antalya", phone: "+905553332200" },
    { email: "karadeniz-demir@imeceburada.com", name: "Karadeniz Demir Çelik", city: "Trabzon", phone: "+905553332201" },
  ];
  const suppliers = [supplier];
  for (const def of supplierDefs) {
    const u = await prisma.user.upsert({
      where: { email: def.email },
      update: {},
      create: {
        email: def.email,
        passwordHash,
        role: "SUPPLIER",
        supplierProfile: {
          create: {
            companyName: def.name,
            city: def.city,
            phone: def.phone,
            phoneVerifiedAt: new Date(),
            membershipStatus: "ACTIVE",
            membershipExpiresAt: MEMBER_UNTIL(),
          },
        },
      },
      include: { supplierProfile: true },
    });
    suppliers.push(u);
  }

  const subcontractorUser = await prisma.user.upsert({
    where: { email: "guven-kalip@imeceburada.com" },
    update: {},
    create: {
      email: "guven-kalip@imeceburada.com",
      passwordHash,
      role: "SUBCONTRACTOR",
      subcontractorProfile: {
        create: {
          companyName: "Güven Kalıp Taşeronluk",
          city: "İstanbul",
          tradeCategories: ["KALIPCI", "BETONCU"],
          description: "10+ yıllık kalıp ve betonarme taşeronluk hizmeti.",
          isPublic: true,
          phone: "+905553332299",
          phoneVerifiedAt: new Date(),
          membershipStatus: "ACTIVE",
          membershipExpiresAt: MEMBER_UNTIL(),
        },
      },
    },
    include: { subcontractorProfile: true },
  });

  // ── Ek iş ilanları ─────────────────────────────────────────────────────────
  const companyIds = companies.map((c) => c.companyProfile?.id).filter((id): id is string => !!id);
  const jobDefs = [
    { id: "00000000-0000-4000-8000-000000000010", companyIndex: 1, title: "Elektrik Ustası Aranıyor", tradeCategory: "ELEKTRIKCI", city: "Ankara", employmentType: "FULL_TIME" as const, salaryMin: 25000, salaryMax: 32000, isUrgent: true, description: "Ticari bina projesinde çalışacak deneyimli elektrik ustası aranmaktadır. Pano ve tesisat bilgisi şart." },
    { id: "00000000-0000-4000-8000-000000000011", companyIndex: 2, title: "Kaynakçı (Argon/MIG-MAG)", tradeCategory: "KAYNAKCI", city: "İzmir", employmentType: "CONTRACT" as const, salaryMin: 1500, salaryMax: 2000, isUrgent: false, description: "Çelik konstrüksiyon projesinde görevlendirilmek üzere deneyimli kaynakçı aranıyor." },
    { id: "00000000-0000-4000-8000-000000000012", companyIndex: 3, title: "Demirci Ustası ve Yardımcısı", tradeCategory: "DEMIRCI", city: "Bursa", employmentType: "DAILY" as const, salaryMin: 1100, salaryMax: 1500, isUrgent: true, description: "Betonarme demir bağlama ve montaj işleri için usta ve yardımcı eleman aranıyor. Acil başlangıç." },
    { id: "00000000-0000-4000-8000-000000000013", companyIndex: 0, title: "Boyacı Usta Aranıyor", tradeCategory: "BOYACI", city: "İstanbul", employmentType: "DAILY" as const, salaryMin: 1000, salaryMax: 1300, isUrgent: false, description: "İç/dış cephe boya işleri için deneyimli usta aranmaktadır." },
    { id: "00000000-0000-4000-8000-000000000014", companyIndex: 1, title: "Su Tesisatçısı", tradeCategory: "SU_TESISATCISI", city: "Ankara", employmentType: "FULL_TIME" as const, salaryMin: 22000, salaryMax: 28000, isUrgent: false, description: "Konut projesinde sıhhi tesisat kurulumu için usta aranıyor." },
    { id: "00000000-0000-4000-8000-000000000015", companyIndex: 2, title: "Vinç Operatörü", tradeCategory: "VINC_OPERATORU", city: "İzmir", employmentType: "CONTRACT" as const, salaryMin: 1800, salaryMax: 2400, isUrgent: false, description: "Kule vinç operatörlük belgesi olan deneyimli personel aranmaktadır." },
    { id: "00000000-0000-4000-8000-000000000016", companyIndex: 3, title: "Fayans/Seramik Ustası", tradeCategory: "FAYANS_USTASI", city: "Bursa", employmentType: "DAILY" as const, salaryMin: 1200, salaryMax: 1600, isUrgent: false, description: "Banyo/mutfak seramik döşeme işleri için usta aranıyor." },
  ];
  for (const def of jobDefs) {
    const companyId = companyIds[def.companyIndex];
    if (!companyId) continue;
    await prisma.jobPosting.upsert({
      where: { id: def.id },
      update: {},
      create: {
        id: def.id,
        companyId,
        title: def.title,
        tradeCategory: def.tradeCategory,
        city: def.city,
        employmentType: def.employmentType,
        salaryMin: def.salaryMin,
        salaryMax: def.salaryMax,
        isUrgent: def.isUrgent,
        description: def.description,
      },
    });
  }

  // ── Ekipman ilanları (kiralık + satılık) ────────────────────────────────────
  const equipmentOwnerId = company.id;
  const equipmentDefs = [
    { id: "00000000-0000-4000-8000-000000000020", equipmentType: "MINI_EKSKAVATOR", capacity: "3-5 Ton", city: "İstanbul", listingType: "RENT" as const, dailyRate: 3500, description: "Bakımlı mini ekskavatör, operatörlü/operatörsüz kiralık." },
    { id: "00000000-0000-4000-8000-000000000021", equipmentType: "KULE_VINC", capacity: "100-200 Ton", city: "Ankara", listingType: "RENT" as const, dailyRate: 9000, description: "Kule vinç, montaj ve söküm dahil kiralık." },
    { id: "00000000-0000-4000-8000-000000000022", equipmentType: "BETON_POMPASI", capacity: "36-42 Metre", city: "İzmir", listingType: "RENT" as const, hourlyRate: 1200, description: "Mobil beton pompası, saatlik kiralık." },
    { id: "00000000-0000-4000-8000-000000000023", equipmentType: "FORKLIFT", capacity: "5-10 Ton", city: "Bursa", listingType: "SALE" as const, salePrice: 850000, description: "2021 model forklift, az kullanılmış, satılıktır." },
    { id: "00000000-0000-4000-8000-000000000024", equipmentType: "JENERATOR", city: "İstanbul", listingType: "SALE" as const, salePrice: 320000, description: "Dizel jeneratör 150 kVA, satılık." },
    { id: "00000000-0000-4000-8000-000000000025", equipmentType: "OFIS_KONTEYNERI", city: "Ankara", listingType: "RENT" as const, dailyRate: 250, description: "Şantiye ofis konteyneri, elektrik tesisatlı, aylık/günlük kiralık." },
    { id: "00000000-0000-4000-8000-000000000026", equipmentType: "KONAKLAMA_KONTEYNERI", city: "İzmir", listingType: "SALE" as const, salePrice: 180000, description: "4 kişilik konaklama konteyneri, sıfır, satılıktır." },
  ];
  for (const def of equipmentDefs) {
    await prisma.equipmentListing.upsert({
      where: { id: def.id },
      update: {},
      create: {
        id: def.id,
        ownerId: equipmentOwnerId,
        equipmentType: def.equipmentType,
        capacity: def.capacity,
        city: def.city,
        listingType: def.listingType,
        dailyRate: def.dailyRate,
        hourlyRate: def.hourlyRate,
        salePrice: def.salePrice,
        description: def.description,
      },
    });
  }

  // ── Malzeme ilanları ────────────────────────────────────────────────────────
  const supplierIds = suppliers.map((s) => s.supplierProfile?.id).filter((id): id is string => !!id);
  const materialDefs = [
    { id: "00000000-0000-4000-8000-000000000030", supplierIndex: 0, materialType: "DEMIR", unit: "TON", city: "Bursa", price: 28500, description: "İnşaat demiri, tüm çaplarda, fabrika çıkışı." },
    { id: "00000000-0000-4000-8000-000000000031", supplierIndex: 1, materialType: "TUGLA", unit: "ADET", city: "Antalya", price: 6, description: "Delikli tuğla, toptan satış, palet indirimi mevcut." },
    { id: "00000000-0000-4000-8000-000000000032", supplierIndex: 2, materialType: "DEMIR", unit: "TON", city: "Trabzon", price: 28900, description: "Nervürlü inşaat demiri, aynı gün sevkiyat." },
    { id: "00000000-0000-4000-8000-000000000033", supplierIndex: 1, materialType: "BETON_C30", unit: "M3", city: "Antalya", price: 2350, description: "Hazır beton C30, pompalı dökümde ek ücret yok." },
    { id: "00000000-0000-4000-8000-000000000034", supplierIndex: 0, materialType: "SERAMIK_FAYANS", unit: "M2", city: "Bursa", price: 145, description: "İç mekan seramik, çeşitli desenlerde." },
    { id: "00000000-0000-4000-8000-000000000035", supplierIndex: 2, materialType: "CEPHE_BOYASI", unit: "TENEKE", city: "Trabzon", price: 890, description: "Dış cephe silikonlu boya, 20 kg teneke." },
  ];
  for (const def of materialDefs) {
    const supplierId = supplierIds[def.supplierIndex];
    if (!supplierId) continue;
    await prisma.materialListing.upsert({
      where: { id: def.id },
      update: {},
      create: {
        id: def.id,
        supplierId,
        materialType: def.materialType,
        unit: def.unit,
        city: def.city,
        price: def.price,
        description: def.description,
      },
    });
  }

  // ── Şantiye Radarı çağrıları ────────────────────────────────────────────────
  const siteRequestDefs = [
    { id: "00000000-0000-4000-8000-000000000040", requestType: "WORKER" as const, tradeCategory: "BETONCU", title: "Acil 3 Betoncu Lazım", city: "İstanbul", latitude: 41.015, longitude: 28.979, neededCount: 3 },
    { id: "00000000-0000-4000-8000-000000000041", requestType: "EQUIPMENT" as const, equipmentType: "MINI_EKSKAVATOR", title: "Yarım Günlük Mini Ekskavatör", city: "Ankara", latitude: 39.925, longitude: 32.837, neededCount: 1 },
    { id: "00000000-0000-4000-8000-000000000042", requestType: "WORKER" as const, tradeCategory: "ELEKTRIKCI", title: "Elektrikçi Aranıyor - Bugün", city: "İzmir", latitude: 38.423, longitude: 27.142, neededCount: 2 },
    { id: "00000000-0000-4000-8000-000000000043", requestType: "WORKER" as const, tradeCategory: "DEMIRCI", title: "Hafta Sonu Demirci Ekibi", city: "Bursa", latitude: 40.183, longitude: 29.061, neededCount: 4 },
  ];
  for (const def of siteRequestDefs) {
    await prisma.siteRequest.upsert({
      where: { id: def.id },
      update: {},
      create: {
        id: def.id,
        createdById: company.id,
        requestType: def.requestType,
        tradeCategory: def.tradeCategory,
        equipmentType: def.equipmentType,
        title: def.title,
        description: `${def.title} — detaylar için iletişime geçin.`,
        city: def.city,
        latitude: def.latitude,
        longitude: def.longitude,
        neededCount: def.neededCount,
      },
    });
  }

  // ── Ek işçilik/malzeme piyasa verisi ────────────────────────────────────────
  if (candidate) {
    const moreWages = [
      { tradeCategory: "BETONCU", city: "İstanbul", experienceLevel: "MID" as const, amount: 1300, period: "DAILY" as const },
      { tradeCategory: "ELEKTRIKCI", city: "Ankara", experienceLevel: "SENIOR" as const, amount: 1600, period: "DAILY" as const },
      { tradeCategory: "DEMIRCI", city: "Bursa", experienceLevel: "MID" as const, amount: 1250, period: "DAILY" as const },
      { tradeCategory: "BOYACI", city: "İstanbul", experienceLevel: "JUNIOR" as const, amount: 800, period: "DAILY" as const },
      { tradeCategory: "KAYNAKCI", city: "İzmir", experienceLevel: "SENIOR" as const, amount: 1900, period: "DAILY" as const },
    ];
    for (const wage of moreWages) {
      await prisma.wageSubmission.create({ data: { ...wage, submittedById: candidate.id } });
    }

    const materialPrices = [
      { materialType: "DEMIR", unit: "TON", city: "Bursa", amount: 28500 },
      { materialType: "CIMENTO", unit: "TORBA", city: "İstanbul", amount: 210 },
      { materialType: "BETON_C30", unit: "M3", city: "Antalya", amount: 2350 },
      { materialType: "TUGLA", unit: "ADET", city: "Antalya", amount: 6 },
    ];
    for (const mp of materialPrices) {
      await prisma.materialPriceSubmission.create({ data: { ...mp, submittedById: candidate.id } });
    }
  }

  console.log("Seed tamamlandı. Demo giriş: demo-sirket@imeceburada.com / demo-aday@imeceburada.com, şifre: Deneme123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
