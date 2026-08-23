# İmece Burada

İnşaat sektörüne özel iş arama platformu + canlı piyasa endeksi (işçilik ücreti,
malzeme fiyatları), ekipman/makine kiralama pazaryeri ve harita tabanlı anlık
şantiye çağrıları ("Şantiye Radarı").

## Monorepo Yapısı

```
apps/
  api/      NestJS backend (Prisma + PostgreSQL)
  web/      Next.js web uygulaması
  mobile/   Flutter mobil uygulama (pnpm workspace'inin DIŞINDA, ayrı toolchain)
packages/
  shared/   Ortak TypeScript tipleri ve sabitler (meslek listesi, iller, ...) — web ve API kullanır
```

`apps/mobile` bir pnpm paketi değildir (package.json yok) — Flutter/Dart kendi
bağımlılık yönetimini kullanır, bu yüzden `pnpm install`/`pnpm dev` onu
kapsamaz, ayrı çalıştırılır (aşağıda).

## Gereksinimler

- Node.js 20+
- pnpm (`corepack enable` ile gelir, veya `npm i -g pnpm`)
- PostgreSQL 16 (Docker Desktop kuruluysa `docker-compose.yml` ile; yoksa yerel bir
  PostgreSQL kurulumu ile de çalışır)
- Mobil için: Flutter SDK 3.3+ (https://docs.flutter.dev/get-started/install)

## Kurulum — Backend + Web

```bash
# 1) Bağımlılıkları kur
pnpm install

# 2) Ortam değişkenlerini ayarla
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3) Veritabanını başlat (Docker varsa)
docker compose up -d

# Docker yoksa: DATABASE_URL'i (apps/api/.env) kendi PostgreSQL bağlantı
# bilgilerinle güncelle.

# 4) Prisma şemasını uygula ve demo veriyi yükle
pnpm --filter @bau360/api prisma generate
pnpm db:migrate
pnpm db:seed

# 5) Geliştirme sunucularını başlat (api + web birlikte)
pnpm dev
```

`pnpm dev`, Turborepo üzerinden önce `packages/shared`'ı derler, sonra:

- API: http://localhost:3001/api
- Web: http://localhost:3000

Sadece tek bir uygulamayı çalıştırmak için: `pnpm --filter @bau360/web dev`,
`pnpm --filter @bau360/api dev`.

## Kurulum — Mobil (Flutter)

Bu depoda `apps/mobile` altında sadece uygulama kodu (`lib/`, `pubspec.yaml`)
var — native `android/`/`ios/` klasörleri Flutter SDK'sının kendisi tarafından
üretilir (Flutter kurulu olmadığı için burada elle oluşturulmadı, `flutter
create` bunu otomatik yapar). İlk kurulumda:

```bash
cd apps/mobile

# android/ios/web native klasörlerini üret (mevcut lib/ ve pubspec.yaml korunur)
flutter create --org com.bau360 --project-name bau360 .

# bağımlılıkları indir
flutter pub get

# API'nin çalıştığı adresi belirterek başlat
# Android emülatör: 10.0.2.2, iOS simülatör/gerçek cihaz: localhost veya bilgisayarının LAN IP'si
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3001/api
```

API adresi varsayılan olarak `http://localhost:3001/api`'dir
(`lib/core/api_client.dart`); emülatör/cihaz farklıysa yukarıdaki gibi
`--dart-define` ile override edilir.

### Demo hesaplar (seed sonrası)

- Şirket: `demo-sirket@bau360.com` / `Deneme123!`
- Aday: `demo-aday@bau360.com` / `Deneme123!`

## Kapsam (Faz 1)

- **Auth**: aday/şirket kaydı, JWT (access + refresh)
- **İş İlanları**: şirketler ilan açar/yönetir, adaylar arar/filtreler/başvurur
- **İşçilik Ücret Endeksi**: crowdsourced yevmiye/maaş verisi, meslek+şehir+ay
  bazlı ortalama/medyan grafiği (web)
- **Malzeme Fiyat Endeksi**: demir, beton, çimento, tuğla vb. için aynı desen
- **Ekipman/Makine Kiralama Pazaryeri**: iş makinesi sahiplerinin ilan açması,
  arama/filtreleme
- **Şantiye Radarı**: harita üzerinde konum işaretleyerek anlık usta/makine
  çağrısı açma, yanıt verme (web'de Leaflet/OpenStreetMap ile harita)

Mobil (Flutter) uygulama adım adım inşa ediliyor:

- **Adım 1 (tamamlandı)**: sekme navigasyonu iskeleti + Canlı Piyasa Endeksi
  ekranı (işçilik/malzeme, meslek/malzeme + şehir filtresi, aylık
  ortalama/medyan listesi)
- **Adım 2 (sırada)**: Şantiye Radarı (harita) + ilan verme formu
- **Adım 3 (sırada)**: Profil ve VKN/belge doğrulama ekranı

İlanlar, Radar ve Profil sekmeleri şu an "yakında" yer tutucusu gösteriyor.

Gizlilik: endeks agregasyonları, bir (meslek/malzeme + şehir + ay) kombinasyonu
için en az 3 veri girişi olmadıkça gösterilmez.

## Faz 2 (yol haritası)

Bkz. proje planı: şirket doğrulama (VKN/Ticaret Sicili), taşeron/ekip profili,
sertifikasyon/dijital kimlik, bildirimler, admin paneli, mesajlaşma, dış veri
entegrasyonları, premium ilan/abonelik.
