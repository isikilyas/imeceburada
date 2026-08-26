const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { provinces: TURKISH_PROVINCES, professions: TRADE_CATEGORIES } = require("./seed-demo-data.json");

const prisma = new PrismaClient();

const CITY_LISTING_COUNTS = {
  Bursa: 15,
  İstanbul: 4,
  Ankara: 4,
  İzmir: 4,
  Kocaeli: 4,
  Antalya: 4,
  Gaziantep: 4,
  Konya: 4,
};

const DEMO_COMPANIES = [
  { email: "demo-firma-1@imeceburada.com", name: "Uludağ İnşaat ve Taahhüt A.Ş.", city: "Bursa", sector: "Konut İnşaatı" },
  { email: "demo-firma-2@imeceburada.com", name: "Nilüfer Yapı Sanayi Ltd. Şti.", city: "Bursa", sector: "Ticari Yapı" },
  { email: "demo-firma-3@imeceburada.com", name: "Orhangazi Betonarme İnşaat", city: "Bursa", sector: "Betonarme" },
  { email: "demo-firma-4@imeceburada.com", name: "Bursa Kalıp Sistemleri Ltd. Şti.", city: "Bursa", sector: "Kalıp ve İskele" },
  { email: "demo-firma-5@imeceburada.com", name: "Marmara İnşaat Grubu", city: "Bursa", sector: "Altyapı" },
  { email: "demo-firma-6@imeceburada.com", name: "Anadolu Yapı ve Taahhüt A.Ş.", city: "İstanbul", sector: "Konut İnşaatı" },
  { email: "demo-firma-7@imeceburada.com", name: "Başkent İnşaat Mühendislik", city: "Ankara", sector: "Kamu İnşaatı" },
  { email: "demo-firma-8@imeceburada.com", name: "Ege Yapı Sanayi Ltd. Şti.", city: "İzmir", sector: "Konut İnşaatı" },
  { email: "demo-firma-9@imeceburada.com", name: "Akdeniz Konut Yatırım A.Ş.", city: "Antalya", sector: "Turizm Yapıları" },
  { email: "demo-firma-10@imeceburada.com", name: "Güneydoğu Taahhüt İnşaat", city: "Gaziantep", sector: "Sanayi Yapıları" },
];

const EMPLOYMENT_TYPES = [
  { type: "FULL_TIME", weight: 55 },
  { type: "DAILY", weight: 25 },
  { type: "CONTRACT", weight: 15 },
  { type: "PART_TIME", weight: 5 },
];

const TITLE_TEMPLATES = [
  (label, city) => `${city} - ${label} Aranıyor`,
  (label, city, company) => `${company} için Deneyimli ${label}`,
  (label, city) => `${label} (${city} Şantiyesi)`,
  (label, city) => `Acil ${label} - ${city}`,
];

const DESCRIPTION_TEMPLATES = [
  (label, city, company) =>
    `${company} olarak ${city}'de devam eden şantiyemiz için deneyimli ${label} arıyoruz. Sigorta, yol ve yemek şirket tarafından karşılanmaktadır.`,
  (label, city, company) =>
    `${city} bölgesindeki yeni projemizde görevlendirilmek üzere ${label} personeli alınacaktır. Referans ve tecrübe belgesi tercih sebebidir.`,
  (label, city, company) =>
    `${company} bünyesinde ${city} şantiyesinde çalışacak, işini titizlikle yapan ${label} arkadaşlar arıyoruz. Uzun vadeli çalışma imkanı mevcuttur.`,
  (label, city, company) =>
    `${city}'de yürüttüğümüz inşaat projesi kapsamında vardiyalı çalışacak ${label} ihtiyacımız bulunmaktadır. Servis imkanı sağlanmaktadır.`,
];

function pickWeighted(items) {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let r = Math.random() * total;
  for (const i of items) {
    r -= i.weight;
    if (r <= 0) return i.item;
  }
  return items[items.length - 1].item;
}

function wageBand(value) {
  if (/MUHENDIS|MIMAR|RESTORATOR/.test(value)) return [55000, 90000];
  if (/SANTIYE_SEFI|SANTIYE_MUDURU|TEKNIK_OFIS_SORUMLUSU/.test(value)) return [65000, 110000];
  if (/OPERATORU|TEKNISYEN|TEKNIKER|UZMANI/.test(value)) return [38000, 55000];
  if (/SOFORU/.test(value)) return [30000, 42000];
  if (/ISCISI|CIRAK|YARDIMCI_ELEMAN|TEMIZLIK|MALZEME_TASIMA|DEPO_PERSONELI|KALFA/.test(value)) return [22000, 30000];
  return [32000, 48000];
}

function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

async function main() {
  const existing = await prisma.jobPosting.count({ where: { description: { contains: "İmeceBurada demo verisi" } } });
  if (existing > 0) {
    console.log(`Zaten ${existing} demo ilan mevcut, tekrar eklenmeyecek.`);
    return;
  }

  const passwordHash = await bcrypt.hash("Deneme123!", 10);
  const memberUntil = () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const companyIds = [];
  for (const c of DEMO_COMPANIES) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        passwordHash,
        role: "COMPANY",
        companyProfile: {
          create: {
            companyName: c.name,
            sector: c.sector,
            city: c.city,
            phone: "+9055500000" + String(companyIds.length).padStart(2, "0"),
            phoneVerifiedAt: new Date(),
            membershipStatus: "ACTIVE",
            membershipExpiresAt: memberUntil(),
            isPremium: true,
          },
        },
      },
      include: { companyProfile: true },
    });
    if (user.companyProfile) companyIds.push({ id: user.companyProfile.id, name: c.name });
  }

  const kalipDemirPool = TRADE_CATEGORIES.filter((p) => /^(KALIP|DEMIR|DONATI|HASIR_CELIK|FILIZ)/.test(p.value));
  const otherPool = TRADE_CATEGORIES.filter((p) => !/^(KALIP|DEMIR|DONATI|HASIR_CELIK|FILIZ)/.test(p.value));
  const professionPool = [
    ...kalipDemirPool.map((item) => ({ item, weight: 3 })),
    ...otherPool.map((item) => ({ item, weight: 1 })),
  ];

  const jobs = [];
  for (const city of TURKISH_PROVINCES) {
    const count = CITY_LISTING_COUNTS[city] || 1;
    for (let i = 0; i < count; i++) {
      const profession = pickWeighted(professionPool);
      const company = companyIds[randomInt(0, companyIds.length)];
      const titleFn = TITLE_TEMPLATES[randomInt(0, TITLE_TEMPLATES.length)];
      const descFn = DESCRIPTION_TEMPLATES[randomInt(0, DESCRIPTION_TEMPLATES.length)];
      const [wMin, wMax] = wageBand(profession.value);
      const salaryMin = Math.round(randomInt(wMin, wMin + (wMax - wMin) / 2) / 500) * 500;
      const salaryMax = Math.round(randomInt(salaryMin + 2000, wMax) / 500) * 500;
      const employmentType = pickWeighted(EMPLOYMENT_TYPES.map((e) => ({ item: e.type, weight: e.weight })));
      const createdAt = new Date(Date.now() - randomInt(0, 45) * 24 * 60 * 60 * 1000);

      jobs.push({
        companyId: company.id,
        title: titleFn(profession.label, city, company.name),
        tradeCategory: profession.value,
        city,
        employmentType,
        salaryMin,
        salaryMax,
        isUrgent: Math.random() < 0.15,
        description: descFn(profession.label, city, company.name) + " (İmeceBurada demo verisi)",
        status: "ACTIVE",
        createdAt,
      });
    }
  }

  await prisma.jobPosting.createMany({ data: jobs });
  console.log(`SEED_OK: ${jobs.length} demo ilan oluşturuldu (${companyIds.length} firma).`);
}

main()
  .catch((e) => {
    console.error("SEED_FAILED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
