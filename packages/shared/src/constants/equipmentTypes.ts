export interface EquipmentTypeDef {
  value: string;
  label: string;
}

export interface EquipmentCategory {
  icon: string;
  label: string;
  items: EquipmentTypeDef[];
}

/**
 * İş makinesi / ekipman kategorileri (kazı, taşıma, vinç, beton, kalıp, yol,
 * kırma-delme-kesme, kaynak, enerji, pompa, ısıtma, temizlik, ölçüm, şantiye
 * ekipmanları). Aynı ekipman (ör. "Beton Kesme Makinesi") birden fazla
 * kategoride görünebilir; bu durumda aynı `value` kodunu paylaşır.
 */
export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  {
    icon: "🚜",
    label: "Kazı, Hafriyat ve Yükleme",
    items: [
      { value: "EKSKAVATOR", label: "Ekskavatör" },
      { value: "MINI_EKSKAVATOR", label: "Mini Ekskavatör" },
      { value: "PALETLI_EKSKAVATOR", label: "Paletli Ekskavatör" },
      { value: "LASTIKLI_EKSKAVATOR", label: "Lastikli Ekskavatör" },
      { value: "BEKOLODER", label: "Bekoloder" },
      { value: "LODER", label: "Loder" },
      { value: "MINI_LODER", label: "Mini Loder" },
      { value: "SKID_STEER", label: "Skid Steer" },
      { value: "DOZER", label: "Dozer" },
      { value: "GREYDER", label: "Greyder" },
      { value: "KANAL_KAZICI", label: "Kanal Kazıcı" },
      { value: "KAYA_KIRICI", label: "Kaya Kırıcı" },
      { value: "HIDROLIK_KIRICI", label: "Hidrolik Kırıcı" },
      { value: "KAYA_DELICI", label: "Kaya Delici" },
    ],
  },
  {
    icon: "🚛",
    label: "Taşıma ve Nakliye",
    items: [
      { value: "HAFRIYAT_KAMYONU", label: "Hafriyat Kamyonu" },
      { value: "DAMPERLI_KAMYON", label: "Damperli Kamyon" },
      { value: "KAYA_KAMYONU", label: "Kaya Kamyonu" },
      { value: "MIKSER", label: "Mikser" },
      { value: "SU_TANKERI", label: "Su Tankeri" },
      { value: "LOWBED", label: "Lowbed" },
      { value: "CEKICI", label: "Çekici" },
      { value: "FORKLIFT", label: "Forklift" },
      { value: "TELEHANDLER", label: "Telehandler" },
      { value: "MANITOU", label: "Manitou" },
    ],
  },
  {
    icon: "🏗️",
    label: "Vinç ve Kaldırma",
    items: [
      { value: "KULE_VINC", label: "Kule Vinç" },
      { value: "MOBIL_VINC", label: "Mobil Vinç" },
      { value: "SEPETLI_VINC", label: "Sepetli Vinç" },
      { value: "ARAC_USTU_VINC", label: "Araç Üstü Vinç" },
      { value: "TELESKOPIK_VINC", label: "Teleskopik Vinç" },
      { value: "ORUMCEK_VINC", label: "Örümcek Vinç" },
      { value: "MINI_VINC", label: "Mini Vinç" },
      { value: "MALZEME_ASANSORU", label: "Malzeme Asansörü" },
      { value: "INSAAT_ASANSORU", label: "İnşaat Asansörü" },
      { value: "MAKASLI_PLATFORM", label: "Makaslı Platform" },
      { value: "EKLEMLI_PLATFORM", label: "Eklemli Platform" },
      { value: "PERSONEL_PLATFORMU", label: "Personel Platformu" },
    ],
  },
  {
    icon: "🧱",
    label: "Beton ve Şap",
    items: [
      { value: "BETON_POMPASI", label: "Beton Pompası" },
      { value: "MINI_BETON_POMPASI", label: "Mini Beton Pompası" },
      { value: "BETON_MIKSERI", label: "Beton Mikseri" },
      { value: "BETON_VIBRATORU", label: "Beton Vibratörü" },
      { value: "LAZERLI_MASTAR", label: "Lazerli Mastar" },
      { value: "BETON_MASTARI", label: "Beton Mastarı" },
      { value: "HELIKOPTER_PERDAH_MAKINESI", label: "Helikopter Perdah Makinesi" },
      { value: "BETON_KESME_MAKINESI", label: "Beton Kesme Makinesi" },
      { value: "BETON_KIRMA_MAKINESI", label: "Beton Kırma Makinesi" },
      { value: "SAP_POMPASI", label: "Şap Pompası" },
      { value: "HARC_MAKINESI", label: "Harç Makinesi" },
      { value: "SIVA_MAKINESI", label: "Sıva Makinesi" },
      { value: "ALCI_MAKINESI", label: "Alçı Makinesi" },
    ],
  },
  {
    icon: "🏢",
    label: "Kalıp ve İskele",
    items: [
      { value: "CEPHE_ISKELESI", label: "Cephe İskelesi" },
      { value: "MOBIL_ISKELE", label: "Mobil İskele" },
      { value: "KALIP_ISKELESI", label: "Kalıp İskelesi" },
      { value: "TELESKOPIK_DIKME", label: "Teleskopik Dikme" },
      { value: "H20_DIKME", label: "H20 Dikme" },
      { value: "PANEL_KALIP", label: "Panel Kalıp" },
      { value: "PERDE_KALIP", label: "Perde Kalıp" },
      { value: "TUNEL_KALIP", label: "Tünel Kalıp" },
      { value: "KALIP_TASIMA_ARABASI", label: "Kalıp Taşıma Arabası" },
      { value: "KALIP_EKIPMANLARI", label: "Kalıp Ekipmanları" },
    ],
  },
  {
    icon: "🛣️",
    label: "Yol ve Zemin",
    items: [
      { value: "SILINDIR", label: "Silindir" },
      { value: "MINI_SILINDIR", label: "Mini Silindir" },
      { value: "VIBRASYONLU_SILINDIR", label: "Vibrasyonlu Silindir" },
      { value: "KECI_AYAKLI_SILINDIR", label: "Keçi Ayaklı Silindir" },
      { value: "ASFALT_SILINDIRI", label: "Asfalt Silindiri" },
      { value: "ASFALT_FINISERI", label: "Asfalt Finişeri" },
      { value: "ASFALT_FREZESI", label: "Asfalt Frezesi" },
      { value: "YOL_SUPURME_MAKINESI", label: "Yol Süpürme Makinesi" },
      { value: "KOMPAKTOR", label: "Kompaktör" },
      { value: "TOKMAK", label: "Tokmak" },
      { value: "ZEMIN_SIKISTIRMA_MAKINESI", label: "Zemin Sıkıştırma Makinesi" },
    ],
  },
  {
    icon: "🔨",
    label: "Kırma, Delme ve Kesme",
    items: [
      { value: "HILTI", label: "Hilti" },
      { value: "KIRICI", label: "Kırıcı" },
      { value: "KIRICI_DELICI", label: "Kırıcı-Delici" },
      { value: "KAROT_MAKINESI", label: "Karot Makinesi" },
      { value: "BETON_KESME_MAKINESI", label: "Beton Kesme Makinesi" },
      { value: "DUVAR_KESME_MAKINESI", label: "Duvar Kesme Makinesi" },
      { value: "ASFALT_KESME_MAKINESI", label: "Asfalt Kesme Makinesi" },
      { value: "DERZ_KESME_MAKINESI", label: "Derz Kesme Makinesi" },
      { value: "ELMAS_KESIM_MAKINESI", label: "Elmas Kesim Makinesi" },
      { value: "MANYETIK_MATKAP", label: "Manyetik Matkap" },
    ],
  },
  {
    icon: "🔧",
    label: "Kaynak ve Metal İşleme",
    items: [
      { value: "ELEKTROT_KAYNAK_MAKINESI", label: "Elektrot Kaynak Makinesi" },
      { value: "GAZALTI_KAYNAK_MAKINESI", label: "Gazaltı Kaynak Makinesi" },
      { value: "TIG_KAYNAK_MAKINESI", label: "TIG Kaynak Makinesi" },
      { value: "MIG_MAG_KAYNAK_MAKINESI", label: "MIG/MAG Kaynak Makinesi" },
      { value: "KAYNAK_JENERATORU", label: "Kaynak Jeneratörü" },
      { value: "PLAZMA_KESIM_MAKINESI", label: "Plazma Kesim Makinesi" },
      { value: "DEMIR_KESME_MAKINESI", label: "Demir Kesme Makinesi" },
      { value: "DEMIR_BUKME_MAKINESI", label: "Demir Bükme Makinesi" },
      { value: "PROFIL_KESME_MAKINESI", label: "Profil Kesme Makinesi" },
      { value: "BORU_BUKME_MAKINESI", label: "Boru Bükme Makinesi" },
      { value: "BORU_KAYNAK_MAKINESI", label: "Boru Kaynak Makinesi" },
    ],
  },
  {
    icon: "⚡",
    label: "Jeneratör, Kompresör ve Enerji",
    items: [
      { value: "JENERATOR", label: "Jeneratör" },
      { value: "DIZEL_JENERATOR", label: "Dizel Jeneratör" },
      { value: "BENZINLI_JENERATOR", label: "Benzinli Jeneratör" },
      { value: "KAYNAK_JENERATORU", label: "Kaynak Jeneratörü" },
      { value: "KOMPRESOR", label: "Kompresör" },
      { value: "HAVA_KOMPRESORU", label: "Hava Kompresörü" },
      { value: "AYDINLATMA_KULESI", label: "Aydınlatma Kulesi" },
      { value: "SANTIYE_AYDINLATMASI", label: "Şantiye Aydınlatması" },
      { value: "ELEKTRIK_PANOSU", label: "Elektrik Panosu" },
    ],
  },
  {
    icon: "💧",
    label: "Pompa ve Drenaj",
    items: [
      { value: "DALGIC_POMPA", label: "Dalgıç Pompa" },
      { value: "PIS_SU_POMPASI", label: "Pis Su Pompası" },
      { value: "CAMUR_POMPASI", label: "Çamur Pompası" },
      { value: "DRENAJ_POMPASI", label: "Drenaj Pompası" },
      { value: "MOTOPOMP", label: "Motopomp" },
      { value: "DIZEL_MOTOPOMP", label: "Dizel Motopomp" },
      { value: "HIDROFOR", label: "Hidrofor" },
      { value: "SU_TANKI", label: "Su Tankı" },
      { value: "SU_DEPOSU", label: "Su Deposu" },
    ],
  },
  {
    icon: "🌬️",
    label: "Isıtma, Kurutma ve Havalandırma",
    items: [
      { value: "MAZOTLU_ISITICI", label: "Mazotlu Isıtıcı" },
      { value: "ELEKTRIKLI_ISITICI", label: "Elektrikli Isıtıcı" },
      { value: "GAZLI_ISITICI", label: "Gazlı Isıtıcı" },
      { value: "ENDUSTRIYEL_FAN", label: "Endüstriyel Fan" },
      { value: "HAVA_UFLEME_MAKINESI", label: "Hava Üfleme Makinesi" },
      { value: "NEM_ALMA_CIHAZI", label: "Nem Alma Cihazı" },
      { value: "ENDUSTRIYEL_KURUTUCU", label: "Endüstriyel Kurutucu" },
    ],
  },
  {
    icon: "🧹",
    label: "Temizlik",
    items: [
      { value: "BASINCLI_YIKAMA_MAKINESI", label: "Basınçlı Yıkama Makinesi" },
      { value: "ENDUSTRIYEL_SUPURGE", label: "Endüstriyel Süpürge" },
      { value: "ZEMIN_TEMIZLEME_MAKINESI", label: "Zemin Temizleme Makinesi" },
      { value: "ZEMIN_SILME_MAKINESI", label: "Zemin Silme Makinesi" },
      { value: "YOL_SUPURME_MAKINESI", label: "Yol Süpürme Makinesi" },
    ],
  },
  {
    icon: "📐",
    label: "Ölçüm ve Teknik Ekipman",
    items: [
      { value: "TOTAL_STATION", label: "Total Station" },
      { value: "GNSS_GPS", label: "GNSS/GPS" },
      { value: "NIVO", label: "Nivo" },
      { value: "LAZER_NIVO", label: "Lazer Nivo" },
      { value: "ROTATIF_LAZER", label: "Rotatif Lazer" },
      { value: "LAZER_METRE", label: "Lazer Metre" },
      { value: "TERMAL_KAMERA", label: "Termal Kamera" },
      { value: "NEM_OLCER", label: "Nem Ölçer" },
      { value: "BETON_TEST_CIHAZLARI", label: "Beton Test Cihazları" },
      { value: "KABLO_BORU_DEDEKTORU", label: "Kablo/Boru Dedektörü" },
    ],
  },
  {
    icon: "🏕️",
    label: "Şantiye Ekipmanları",
    items: [
      { value: "SANTIYE_KONTEYNERI", label: "Şantiye Konteyneri" },
      { value: "OFIS_KONTEYNERI", label: "Ofis Konteyneri" },
      { value: "KONAKLAMA_KONTEYNERI", label: "Konaklama Konteyneri" },
      { value: "WC_KONTEYNERI", label: "WC Konteyneri" },
      { value: "DUS_KONTEYNERI", label: "Duş Konteyneri" },
      { value: "GUVENLIK_KABINI", label: "Güvenlik Kabini" },
      { value: "YAKIT_TANKI", label: "Yakıt Tankı" },
      { value: "SU_DEPOSU", label: "Su Deposu" },
      { value: "SANTIYE_CITI", label: "Şantiye Çiti" },
      { value: "BARIYER", label: "Bariyer" },
      { value: "MOBIL_AYDINLATMA", label: "Mobil Aydınlatma" },
    ],
  },
];

const seen = new Map<string, EquipmentTypeDef>();
for (const category of EQUIPMENT_CATEGORIES) {
  for (const item of category.items) {
    if (!seen.has(item.value)) seen.set(item.value, item);
  }
}

/** Geriye dönük uyumluluk: düz ekipman listesi (value+label), her ekipman tek kez. */
export const EQUIPMENT_TYPES: EquipmentTypeDef[] = Array.from(seen.values());

export const EQUIPMENT_TYPE_VALUES = EQUIPMENT_TYPES.map((e) => e.value);

/**
 * Ekipman kategorisine göre kapasite/tonaj/ebat sınıfları — her kategori
 * sektörde gerçekten kullanılan ölçü birimiyle sınıflandırılır (ağırlık sınıfı
 * ton olarak kazı/taşıma/vinç/silindirde, uzunluk metre olarak beton pompası
 * bom uzunluğu ve iskele/kalıp yüksekliğinde). Burada olmayan kategoriler
 * (kaynak/jeneratör/pompa/ölçüm vb.) için sektörde tek bir standart sınıf
 * olmadığından listeye zorlama yapılmaz — ilanda serbest metin ("Diğer")
 * olarak girilir.
 */
export const EQUIPMENT_CAPACITY_OPTIONS_BY_CATEGORY: Record<string, string[]> = {
  "Kazı, Hafriyat ve Yükleme": [
    "0-3 Ton",
    "3-5 Ton",
    "5-8 Ton",
    "8-12 Ton",
    "12-16 Ton",
    "16-20 Ton",
    "20-25 Ton",
    "25-30 Ton",
    "30-40 Ton",
    "40-50 Ton",
    "50-70 Ton",
    "70+ Ton",
  ],
  "Taşıma ve Nakliye": ["0-5 Ton", "5-10 Ton", "10-15 Ton", "15-20 Ton", "20-30 Ton", "30-40 Ton", "40+ Ton"],
  "Vinç ve Kaldırma": ["0-10 Ton", "10-25 Ton", "25-50 Ton", "50-100 Ton", "100-200 Ton", "200-400 Ton", "400+ Ton"],
  "Beton ve Şap": ["0-20 Metre", "20-25 Metre", "25-30 Metre", "30-36 Metre", "36-42 Metre", "42-48 Metre", "48-56 Metre", "56+ Metre"],
  "Kalıp ve İskele": ["0-2 Metre", "2-4 Metre", "4-6 Metre", "6-10 Metre", "10-15 Metre", "15-20 Metre", "20-30 Metre", "30+ Metre"],
  "Yol ve Zemin": ["0-1 Ton", "1-3 Ton", "3-6 Ton", "6-10 Ton", "10-15 Ton", "15+ Ton"],
};

/** Geriye dönük uyumluluk: kategori bilinmediğinde kullanılan genel ton listesi. */
export const EQUIPMENT_CAPACITY_OPTIONS: string[] = EQUIPMENT_CAPACITY_OPTIONS_BY_CATEGORY["Kazı, Hafriyat ve Yükleme"];
