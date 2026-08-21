export interface TradeProfession {
  value: string;
  label: string;
}

export interface TradeBranch {
  label: string;
  professions: TradeProfession[];
}

export interface TradeField {
  icon: string;
  label: string;
  branches: TradeBranch[];
}

/**
 * Meslekler Alan (KABA YAPI, İNCE YAPI, ...) > Branş (Kalıp İşleri, ...) > Meslek
 * (Kalıp Ustası, ...) olmak üzere 3 seviyeli hiyerarşi halinde tutulur. Aynı meslek
 * (ör. "Beton Pompa Operatörü") birden fazla branş altında görünebilir; bu durumda
 * aynı `value` kodunu paylaşır (aşağıdaki TRADE_CATEGORIES listesinde tekrar etmez).
 */
export const TRADE_FIELDS: TradeField[] = [
  {
    icon: "🏗️",
    label: "Kaba Yapı",
    branches: [
      {
        label: "Kalıp İşleri",
        professions: [
          { value: "KALIP_USTASI", label: "Kalıp Ustası" },
          { value: "KALIPCI", label: "Kalıpçı" },
          { value: "KALIP_KALFASI", label: "Kalıp Kalfası" },
          { value: "AHSAP_KALIP_USTASI", label: "Ahşap Kalıp Ustası" },
          { value: "SISTEM_KALIP_USTASI", label: "Sistem Kalıp Ustası" },
          { value: "TUNEL_KALIP_USTASI", label: "Tünel Kalıp Ustası" },
          { value: "PERDE_KALIP_USTASI", label: "Perde Kalıp Ustası" },
          { value: "ISKELE_KALIP_USTASI", label: "İskele Kalıp Ustası" },
          { value: "KALIP_SOKUM_USTASI", label: "Kalıp Söküm Ustası" },
        ],
      },
      {
        label: "Demir İşleri",
        professions: [
          { value: "DEMIR_USTASI", label: "Demir Ustası" },
          { value: "DEMIR_BAGLAMA_USTASI", label: "Demir Bağlama Ustası" },
          { value: "DEMIRCI", label: "Demirci" },
          { value: "DEMIR_KALFASI", label: "Demir Kalfası" },
          { value: "DONATI_USTASI", label: "Donatı Ustası" },
          { value: "HASIR_CELIK_USTASI", label: "Hasır Çelik Ustası" },
          { value: "FILIZ_EKIMI_USTASI", label: "Filiz Ekimi Ustası" },
        ],
      },
      {
        label: "Beton İşleri",
        professions: [
          { value: "BETON_USTASI", label: "Beton Ustası" },
          { value: "BETONCU", label: "Betoncu" },
          { value: "BETON_VIBRATORCUSU", label: "Beton Vibratörcüsü" },
          { value: "BETON_POMPA_OPERATORU", label: "Beton Pompa Operatörü" },
          { value: "BETON_SANTRAL_OPERATORU", label: "Beton Santral Operatörü" },
          { value: "BETON_PERDAH_USTASI", label: "Beton Perdah Ustası" },
          { value: "BETON_KESME_USTASI", label: "Beton Kesme Ustası" },
          { value: "BETON_DELME_USTASI", label: "Beton Delme Ustası" },
        ],
      },
      {
        label: "Duvar İşleri",
        professions: [
          { value: "DUVAR_USTASI", label: "Duvar Ustası" },
          { value: "TUGLA_USTASI", label: "Tuğla Ustası" },
          { value: "GAZBETON_USTASI", label: "Gazbeton Ustası" },
          { value: "BIMS_USTASI", label: "Bims Ustası" },
          { value: "TAS_DUVAR_USTASI", label: "Taş Duvar Ustası" },
          { value: "BRIKET_USTASI", label: "Briket Ustası" },
          { value: "YIGMA_YAPI_USTASI", label: "Yığma Yapı Ustası" },
        ],
      },
    ],
  },
  {
    icon: "🧱",
    label: "İnce Yapı",
    branches: [
      {
        label: "Sıva İşleri",
        professions: [
          { value: "SIVA_USTASI", label: "Sıva Ustası" },
          { value: "KARA_SIVA_USTASI", label: "Kara Sıva Ustası" },
          { value: "ALCI_SIVA_USTASI", label: "Alçı Sıva Ustası" },
          { value: "MAKINE_SIVA_USTASI", label: "Makine Sıva Ustası" },
          { value: "DEKORATIF_SIVA_USTASI", label: "Dekoratif Sıva Ustası" },
        ],
      },
      {
        label: "Alçı ve Alçıpan",
        professions: [
          { value: "ALCI_USTASI", label: "Alçı Ustası" },
          { value: "ALCIPAN_USTASI", label: "Alçıpan Ustası" },
          { value: "ALCIPAN_TAVAN_USTASI", label: "Alçıpan Tavan Ustası" },
          { value: "BOLME_DUVAR_USTASI", label: "Bölme Duvar Ustası" },
          { value: "ASMA_TAVAN_USTASI", label: "Asma Tavan Ustası" },
          { value: "DEKORATIF_ALCI_USTASI", label: "Dekoratif Alçı Ustası" },
        ],
      },
      {
        label: "Boya",
        professions: [
          { value: "BOYA_USTASI", label: "Boya Ustası" },
          { value: "BOYACI", label: "Boyacı" },
          { value: "IC_CEPHE_BOYA_USTASI", label: "İç Cephe Boya Ustası" },
          { value: "DIS_CEPHE_BOYA_USTASI", label: "Dış Cephe Boya Ustası" },
          { value: "DEKORATIF_BOYA_USTASI", label: "Dekoratif Boya Ustası" },
          { value: "EPOKSI_BOYA_USTASI", label: "Epoksi Boya Ustası" },
        ],
      },
      {
        label: "Zemin ve Kaplama",
        professions: [
          { value: "FAYANS_USTASI", label: "Fayans Ustası" },
          { value: "SERAMIK_USTASI", label: "Seramik Ustası" },
          { value: "GRANIT_USTASI", label: "Granit Ustası" },
          { value: "MERMER_USTASI", label: "Mermer Ustası" },
          { value: "MOZAIK_USTASI", label: "Mozaik Ustası" },
          { value: "PARKE_USTASI", label: "Parke Ustası" },
          { value: "LAMINAT_PARKE_USTASI", label: "Laminat Parke Ustası" },
          { value: "PVC_ZEMIN_USTASI", label: "PVC Zemin Ustası" },
          { value: "EPOKSI_ZEMIN_USTASI", label: "Epoksi Zemin Ustası" },
          { value: "SAP_USTASI", label: "Şap Ustası" },
        ],
      },
    ],
  },
  {
    icon: "🏢",
    label: "Dış Cephe",
    branches: [
      {
        label: "Mantolama",
        professions: [
          { value: "MANTOLAMA_USTASI", label: "Mantolama Ustası" },
          { value: "ISI_YALITIM_USTASI", label: "Isı Yalıtım Ustası" },
          { value: "DIS_CEPHE_USTASI", label: "Dış Cephe Ustası" },
          { value: "SOVE_USTASI", label: "Söve Ustası" },
          { value: "FILE_SIVA_USTASI", label: "File Sıva Ustası" },
        ],
      },
      {
        label: "Cephe Sistemleri",
        professions: [
          { value: "ALUMINYUM_CEPHE_USTASI", label: "Alüminyum Cephe Ustası" },
          { value: "CAM_CEPHE_USTASI", label: "Cam Cephe Ustası" },
          { value: "KOMPOZIT_CEPHE_USTASI", label: "Kompozit Cephe Ustası" },
          { value: "GIYDIRME_CEPHE_USTASI", label: "Giydirme Cephe Ustası" },
          { value: "PREKAST_CEPHE_USTASI", label: "Prekast Cephe Ustası" },
          { value: "SILIKON_CEPHE_USTASI", label: "Silikon Cephe Ustası" },
        ],
      },
    ],
  },
  {
    icon: "🚰",
    label: "Mekanik Tesisat",
    branches: [
      {
        label: "Sıhhi Tesisat",
        professions: [
          { value: "SIHHI_TESISAT_USTASI", label: "Sıhhi Tesisat Ustası" },
          { value: "SU_TESISATCISI", label: "Su Tesisatçısı" },
          { value: "TEMIZ_SU_TESISATCISI", label: "Temiz Su Tesisatçısı" },
          { value: "PIS_SU_TESISATCISI", label: "Pis Su Tesisatçısı" },
          { value: "YAGMUR_SUYU_TESISATCISI", label: "Yağmur Suyu Tesisatçısı" },
          { value: "PPRC_TESISAT_USTASI", label: "PPRC Tesisat Ustası" },
          { value: "PVC_TESISAT_USTASI", label: "PVC Tesisat Ustası" },
        ],
      },
      {
        label: "Isıtma",
        professions: [
          { value: "KALORIFER_TESISATCISI", label: "Kalorifer Tesisatçısı" },
          { value: "YERDEN_ISITMA_USTASI", label: "Yerden Isıtma Ustası" },
          { value: "RADYATOR_USTASI", label: "Radyatör Ustası" },
          { value: "KAZAN_USTASI", label: "Kazan Ustası" },
          { value: "ISI_MERKEZI_USTASI", label: "Isı Merkezi Ustası" },
        ],
      },
      {
        label: "Doğalgaz",
        professions: [
          { value: "DOGALGAZ_TESISAT_USTASI", label: "Doğalgaz Tesisat Ustası" },
          { value: "DOGALGAZ_KAYNAKCISI", label: "Doğalgaz Kaynakçısı" },
          { value: "DOGALGAZ_MONTAJ_USTASI", label: "Doğalgaz Montaj Ustası" },
          { value: "DOGALGAZ_TEKNISYENI", label: "Doğalgaz Teknisyeni" },
        ],
      },
      {
        label: "Yangın Tesisatı",
        professions: [
          { value: "YANGIN_TESISAT_USTASI", label: "Yangın Tesisat Ustası" },
          { value: "SPRINKLER_USTASI", label: "Sprinkler Ustası" },
          { value: "YANGIN_DOLABI_MONTAJ_USTASI", label: "Yangın Dolabı Montaj Ustası" },
          { value: "YANGIN_HIDROFOR_USTASI", label: "Yangın Hidrofor Ustası" },
        ],
      },
      {
        label: "Havalandırma",
        professions: [
          { value: "HAVALANDIRMA_USTASI", label: "Havalandırma Ustası" },
          { value: "KANAL_MONTAJ_USTASI", label: "Kanal Montaj Ustası" },
          { value: "KLIMA_KANALI_USTASI", label: "Klima Kanalı Ustası" },
          { value: "ASPIRASYON_USTASI", label: "Aspirasyon Ustası" },
          { value: "FAN_MONTAJ_USTASI", label: "Fan Montaj Ustası" },
        ],
      },
      {
        label: "Klima",
        professions: [
          { value: "KLIMA_USTASI", label: "Klima Ustası" },
          { value: "KLIMA_MONTAJ_USTASI", label: "Klima Montaj Ustası" },
          { value: "VRF_USTASI", label: "VRF Ustası" },
          { value: "VRF_TEKNISYENI", label: "VRF Teknisyeni" },
          { value: "SOGUTMA_TEKNISYENI", label: "Soğutma Teknisyeni" },
        ],
      },
    ],
  },
  {
    icon: "⚡",
    label: "Elektrik",
    branches: [
      {
        label: "Elektrik Tesisatı",
        professions: [
          { value: "ELEKTRIK_USTASI", label: "Elektrik Ustası" },
          { value: "ELEKTRIKCI", label: "Elektrikçi" },
          { value: "ELEKTRIK_TEKNISYENI", label: "Elektrik Teknisyeni" },
          { value: "ELEKTRIK_TESISATCISI", label: "Elektrik Tesisatçısı" },
          { value: "KABLO_CEKME_USTASI", label: "Kablo Çekme Ustası" },
          { value: "ELEKTRIK_MONTAJ_USTASI", label: "Elektrik Montaj Ustası" },
        ],
      },
      {
        label: "Pano ve Enerji",
        professions: [
          { value: "ELEKTRIK_PANO_USTASI", label: "Elektrik Pano Ustası" },
          { value: "PANO_MONTAJ_USTASI", label: "Pano Montaj Ustası" },
          { value: "PANO_TEKNISYENI", label: "Pano Teknisyeni" },
          { value: "JENERATOR_USTASI", label: "Jeneratör Ustası" },
          { value: "UPS_TEKNISYENI", label: "UPS Teknisyeni" },
        ],
      },
      {
        label: "Zayıf Akım",
        professions: [
          { value: "ZAYIF_AKIM_USTASI", label: "Zayıf Akım Ustası" },
          { value: "DATA_KABLO_USTASI", label: "Data Kablo Ustası" },
          { value: "TELEFON_TESISATCISI", label: "Telefon Tesisatçısı" },
          { value: "INTERNET_ALTYAPI_USTASI", label: "İnternet Altyapı Ustası" },
          { value: "FIBER_OPTIK_USTASI", label: "Fiber Optik Ustası" },
        ],
      },
      {
        label: "Güvenlik Sistemleri",
        professions: [
          { value: "KAMERA_SISTEMLERI_USTASI", label: "Kamera Sistemleri Ustası" },
          { value: "ALARM_SISTEMLERI_USTASI", label: "Alarm Sistemleri Ustası" },
          { value: "YANGIN_ALARM_SISTEMLERI_USTASI", label: "Yangın Alarm Sistemleri Ustası" },
          { value: "KARTLI_GECIS_SISTEMLERI_USTASI", label: "Kartlı Geçiş Sistemleri Ustası" },
          { value: "DIAFON_USTASI", label: "Diafon Ustası" },
          { value: "INTERKOM_USTASI", label: "İnterkom Ustası" },
        ],
      },
    ],
  },
  {
    icon: "🪟",
    label: "Doğrama ve Montaj",
    branches: [
      {
        label: "PVC ve Alüminyum",
        professions: [
          { value: "PVC_DOGRAMA_USTASI", label: "PVC Doğrama Ustası" },
          { value: "ALUMINYUM_DOGRAMA_USTASI", label: "Alüminyum Doğrama Ustası" },
          { value: "ALUMINYUM_CEPHE_USTASI", label: "Alüminyum Cephe Ustası" },
          { value: "ALUMINYUM_KORKULUK_USTASI", label: "Alüminyum Korkuluk Ustası" },
        ],
      },
      {
        label: "Cam",
        professions: [
          { value: "CAMCI", label: "Camcı" },
          { value: "CAM_BALKON_USTASI", label: "Cam Balkon Ustası" },
          { value: "ISICAM_USTASI", label: "Isıcam Ustası" },
          { value: "DUSAKABIN_USTASI", label: "Duşakabin Ustası" },
          { value: "VITRIN_CAMI_USTASI", label: "Vitrin Camı Ustası" },
        ],
      },
      {
        label: "Kapı ve Pencere",
        professions: [
          { value: "KAPI_USTASI", label: "Kapı Ustası" },
          { value: "CELIK_KAPI_MONTAJ_USTASI", label: "Çelik Kapı Montaj Ustası" },
          { value: "IC_KAPI_MONTAJ_USTASI", label: "İç Kapı Montaj Ustası" },
          { value: "PENCERE_MONTAJ_USTASI", label: "Pencere Montaj Ustası" },
          { value: "PANJUR_USTASI", label: "Panjur Ustası" },
          { value: "SINEKLIK_USTASI", label: "Sineklik Ustası" },
        ],
      },
    ],
  },
  {
    icon: "🔩",
    label: "Metal ve Çelik İşleri",
    branches: [
      {
        label: "Kaynak",
        professions: [
          { value: "KAYNAKCI", label: "Kaynakçı" },
          { value: "ELEKTRIK_KAYNAKCISI", label: "Elektrik Kaynakçısı" },
          { value: "GAZALTI_KAYNAKCISI", label: "Gazaltı Kaynakçısı" },
          { value: "ARGON_KAYNAKCISI", label: "Argon Kaynakçısı" },
          { value: "OKSIJEN_KAYNAKCISI", label: "Oksijen Kaynakçısı" },
          { value: "ALUMINYUM_KAYNAKCISI", label: "Alüminyum Kaynakçısı" },
        ],
      },
      {
        label: "Çelik Konstrüksiyon",
        professions: [
          { value: "CELIK_KONSTRUKSIYON_USTASI", label: "Çelik Konstrüksiyon Ustası" },
          { value: "CELIK_MONTAJ_USTASI", label: "Çelik Montaj Ustası" },
          { value: "CELIK_CATI_USTASI", label: "Çelik Çatı Ustası" },
          { value: "CELIK_MERDIVEN_USTASI", label: "Çelik Merdiven Ustası" },
          { value: "CELIK_KORKULUK_USTASI", label: "Çelik Korkuluk Ustası" },
        ],
      },
      {
        label: "Metal İşleri",
        professions: [
          { value: "DEMIR_DOGRAMA_USTASI", label: "Demir Doğrama Ustası" },
          { value: "FERFORJE_USTASI", label: "Ferforje Ustası" },
          { value: "KORKULUK_USTASI", label: "Korkuluk Ustası" },
          { value: "METAL_MONTAJ_USTASI", label: "Metal Montaj Ustası" },
        ],
      },
    ],
  },
  {
    icon: "🪚",
    label: "Ahşap ve Marangozluk",
    branches: [
      {
        label: "Marangozluk",
        professions: [
          { value: "MARANGOZ", label: "Marangoz" },
          { value: "AHSAP_USTASI", label: "Ahşap Ustası" },
          { value: "MOBILYA_USTASI", label: "Mobilya Ustası" },
          { value: "AHSAP_MONTAJ_USTASI", label: "Ahşap Montaj Ustası" },
        ],
      },
      {
        label: "Çatı",
        professions: [
          { value: "CATI_USTASI", label: "Çatı Ustası" },
          { value: "AHSAP_CATI_USTASI", label: "Ahşap Çatı Ustası" },
          { value: "CATI_KAPLAMA_USTASI", label: "Çatı Kaplama Ustası" },
          { value: "KIREMIT_USTASI", label: "Kiremit Ustası" },
          { value: "SHINGLE_USTASI", label: "Shingle Ustası" },
          { value: "CATI_IZOLASYON_USTASI", label: "Çatı İzolasyon Ustası" },
        ],
      },
      {
        label: "Dekorasyon",
        professions: [
          { value: "AHSAP_DEKORASYON_USTASI", label: "Ahşap Dekorasyon Ustası" },
          { value: "PARKE_USTASI", label: "Parke Ustası" },
          { value: "MERDIVEN_USTASI", label: "Merdiven Ustası" },
          { value: "AHSAP_MERDIVEN_USTASI", label: "Ahşap Merdiven Ustası" },
        ],
      },
    ],
  },
  {
    icon: "💧",
    label: "İzolasyon ve Yalıtım",
    branches: [
      {
        label: "Su Yalıtımı",
        professions: [
          { value: "SU_YALITIM_USTASI", label: "Su Yalıtım Ustası" },
          { value: "MEMBRAN_USTASI", label: "Membran Ustası" },
          { value: "BITUMLU_MEMBRAN_USTASI", label: "Bitümlü Membran Ustası" },
          { value: "SURME_IZOLASYON_USTASI", label: "Sürme İzolasyon Ustası" },
          { value: "TEMEL_IZOLASYON_USTASI", label: "Temel İzolasyon Ustası" },
          { value: "TERAS_IZOLASYON_USTASI", label: "Teras İzolasyon Ustası" },
        ],
      },
      {
        label: "Isı Yalıtımı",
        professions: [
          { value: "ISI_YALITIM_USTASI", label: "Isı Yalıtım Ustası" },
          { value: "MANTOLAMA_USTASI", label: "Mantolama Ustası" },
          { value: "CATI_IZOLASYON_USTASI", label: "Çatı İzolasyon Ustası" },
        ],
      },
      {
        label: "Ses Yalıtımı",
        professions: [
          { value: "SES_YALITIM_USTASI", label: "Ses Yalıtım Ustası" },
          { value: "AKUSTIK_UYGULAMA_USTASI", label: "Akustik Uygulama Ustası" },
        ],
      },
    ],
  },
  {
    icon: "🚜",
    label: "Hafriyat ve Altyapı",
    branches: [
      {
        label: "Hafriyat",
        professions: [
          { value: "HAFRIYAT_USTASI", label: "Hafriyat Ustası" },
          { value: "HAFRIYAT_OPERATORU", label: "Hafriyat Operatörü" },
          { value: "KAZI_USTASI", label: "Kazı Ustası" },
          { value: "DOLGU_USTASI", label: "Dolgu Ustası" },
          { value: "TESVIYE_USTASI", label: "Tesviye Ustası" },
        ],
      },
      {
        label: "Altyapı",
        professions: [
          { value: "KANALIZASYON_USTASI", label: "Kanalizasyon Ustası" },
          { value: "ALTYAPI_USTASI", label: "Altyapı Ustası" },
          { value: "DRENAJ_USTASI", label: "Drenaj Ustası" },
          { value: "YAGMUR_SUYU_ALTYAPI_USTASI", label: "Yağmur Suyu Altyapı Ustası" },
          { value: "ICME_SUYU_ALTYAPI_USTASI", label: "İçme Suyu Altyapı Ustası" },
          { value: "MENFEZ_USTASI", label: "Menfez Ustası" },
        ],
      },
      {
        label: "Yol",
        professions: [
          { value: "ASFALT_USTASI", label: "Asfalt Ustası" },
          { value: "YOL_YAPIM_USTASI", label: "Yol Yapım Ustası" },
          { value: "BORDUR_USTASI", label: "Bordür Ustası" },
          { value: "KALDIRIM_USTASI", label: "Kaldırım Ustası" },
          { value: "PARKE_TASI_USTASI", label: "Parke Taşı Ustası" },
        ],
      },
    ],
  },
  {
    icon: "🚜",
    label: "İş Makineleri ve Operatörler",
    branches: [
      {
        label: "Operatörler",
        professions: [
          { value: "EKSKAVATOR_OPERATORU", label: "Ekskavatör Operatörü" },
          { value: "KEPCE_OPERATORU", label: "Kepçe Operatörü" },
          { value: "JCB_OPERATORU", label: "JCB Operatörü" },
          { value: "BOBCAT_OPERATORU", label: "Bobcat Operatörü" },
          { value: "LODER_OPERATORU", label: "Loder Operatörü" },
          { value: "DOZER_OPERATORU", label: "Dozer Operatörü" },
          { value: "GREYDER_OPERATORU", label: "Greyder Operatörü" },
          { value: "SILINDIR_OPERATORU", label: "Silindir Operatörü" },
          { value: "FORKLIFT_OPERATORU", label: "Forklift Operatörü" },
          { value: "MANITOU_OPERATORU", label: "Manitou Operatörü" },
          { value: "VINC_OPERATORU", label: "Vinç Operatörü" },
          { value: "MOBIL_VINC_OPERATORU", label: "Mobil Vinç Operatörü" },
          { value: "KULE_VINC_OPERATORU", label: "Kule Vinç Operatörü" },
          { value: "BETON_POMPA_OPERATORU", label: "Beton Pompa Operatörü" },
          { value: "ASFALT_FINISER_OPERATORU", label: "Asfalt Finişer Operatörü" },
        ],
      },
    ],
  },
  {
    icon: "👷",
    label: "Teknik ve Şantiye Personeli",
    branches: [
      {
        label: "Mühendislik",
        professions: [
          { value: "INSAAT_MUHENDISI", label: "İnşaat Mühendisi" },
          { value: "MAKINE_MUHENDISI", label: "Makine Mühendisi" },
          { value: "ELEKTRIK_MUHENDISI", label: "Elektrik Mühendisi" },
          { value: "HARITA_MUHENDISI", label: "Harita Mühendisi" },
          { value: "JEOLOJI_MUHENDISI", label: "Jeoloji Mühendisi" },
          { value: "JEOFIZIK_MUHENDISI", label: "Jeofizik Mühendisi" },
        ],
      },
      {
        label: "Mimarlık ve Tasarım",
        professions: [
          { value: "MIMAR", label: "Mimar" },
          { value: "IC_MIMAR", label: "İç Mimar" },
          { value: "PEYZAJ_MIMARI", label: "Peyzaj Mimarı" },
          { value: "RESTORATOR", label: "Restoratör" },
        ],
      },
      {
        label: "Teknik Personel",
        professions: [
          { value: "INSAAT_TEKNIKERI", label: "İnşaat Teknikeri" },
          { value: "INSAAT_TEKNISYENI", label: "İnşaat Teknisyeni" },
          { value: "ELEKTRIK_TEKNIKERI", label: "Elektrik Teknikeri" },
          { value: "MAKINE_TEKNIKERI", label: "Makine Teknikeri" },
          { value: "HARITA_TEKNIKERI", label: "Harita Teknikeri" },
          { value: "HARITA_TEKNISYENI", label: "Harita Teknisyeni" },
        ],
      },
      {
        label: "Şantiye Yönetimi",
        professions: [
          { value: "SANTIYE_SEFI", label: "Şantiye Şefi" },
          { value: "SANTIYE_MUDURU", label: "Şantiye Müdürü" },
          { value: "TEKNIK_OFIS_SORUMLUSU", label: "Teknik Ofis Sorumlusu" },
          { value: "FORMEN", label: "Formen" },
          { value: "USTABASI", label: "Ustabaşı" },
          { value: "SAHA_SORUMLUSU", label: "Saha Sorumlusu" },
          { value: "KALITE_KONTROL_SORUMLUSU", label: "Kalite Kontrol Sorumlusu" },
          { value: "METRAJ_UZMANI", label: "Metraj Uzmanı" },
          { value: "HAKEDIS_UZMANI", label: "Hakediş Uzmanı" },
        ],
      },
    ],
  },
  {
    icon: "📐",
    label: "Harita ve Ölçüm",
    branches: [
      {
        label: "Ölçüm",
        professions: [
          { value: "HARITA_MUHENDISI", label: "Harita Mühendisi" },
          { value: "HARITA_TEKNIKERI", label: "Harita Teknikeri" },
          { value: "HARITA_TEKNISYENI", label: "Harita Teknisyeni" },
          { value: "TOPOGRAF", label: "Topograf" },
          { value: "OLCUM_ELEMANI", label: "Ölçüm Elemanı" },
          { value: "GPS_OLCUM_OPERATORU", label: "GPS Ölçüm Operatörü" },
          { value: "TOTAL_STATION_OPERATORU", label: "Total Station Operatörü" },
          { value: "NIVELMAN_OPERATORU", label: "Nivelman Operatörü" },
          { value: "ARAZI_OLCUM_ELEMANI", label: "Arazi Ölçüm Elemanı" },
        ],
      },
    ],
  },
  {
    icon: "🚛",
    label: "Nakliye ve Lojistik",
    branches: [
      {
        label: "Nakliye",
        professions: [
          { value: "KAMYON_SOFORU", label: "Kamyon Şoförü" },
          { value: "TIR_SOFORU", label: "Tır Şoförü" },
          { value: "HAFRIYAT_KAMYONU_SOFORU", label: "Hafriyat Kamyonu Şoförü" },
          { value: "TRANSMIKSER_SOFORU", label: "Transmikser Şoförü" },
          { value: "BETON_POMPA_SOFORU", label: "Beton Pompa Şoförü" },
          { value: "VINCLI_KAMYON_SOFORU", label: "Vinçli Kamyon Şoförü" },
          { value: "PANELVAN_SOFORU", label: "Panelvan Şoförü" },
          { value: "SEVKIYAT_PERSONELI", label: "Sevkiyat Personeli" },
          { value: "DEPO_SORUMLUSU", label: "Depo Sorumlusu" },
          { value: "LOJISTIK_SORUMLUSU", label: "Lojistik Sorumlusu" },
        ],
      },
    ],
  },
  {
    icon: "👷",
    label: "Yardımcı Personel",
    branches: [
      {
        label: "Yardımcı Personel",
        professions: [
          { value: "INSAAT_ISCISI", label: "İnşaat İşçisi" },
          { value: "BEDEN_ISCISI", label: "Beden İşçisi" },
          { value: "GENEL_INSAAT_ISCISI", label: "Genel İnşaat İşçisi" },
          { value: "KALFA", label: "Kalfa" },
          { value: "CIRAK", label: "Çırak" },
          { value: "YARDIMCI_ELEMAN", label: "Yardımcı Eleman" },
          { value: "SANTIYE_TEMIZLIK_PERSONELI", label: "Şantiye Temizlik Personeli" },
          { value: "MALZEME_TASIMA_PERSONELI", label: "Malzeme Taşıma Personeli" },
          { value: "DEPO_PERSONELI", label: "Depo Personeli" },
        ],
      },
    ],
  },
  {
    icon: "🏡",
    label: "Peyzaj ve Çevre Düzenleme",
    branches: [
      {
        label: "Peyzaj ve Çevre Düzenleme",
        professions: [
          { value: "PEYZAJ_USTASI", label: "Peyzaj Ustası" },
          { value: "BAHCE_USTASI", label: "Bahçe Ustası" },
          { value: "BAHCIVAN", label: "Bahçıvan" },
          { value: "CIM_UYGULAMA_USTASI", label: "Çim Uygulama Ustası" },
          { value: "SULAMA_SISTEMI_USTASI", label: "Sulama Sistemi Ustası" },
          { value: "OTOMATIK_SULAMA_USTASI", label: "Otomatik Sulama Ustası" },
          { value: "AGAC_BUDAMA_USTASI", label: "Ağaç Budama Ustası" },
          { value: "TAS_DUVAR_USTASI", label: "Taş Duvar Ustası" },
          { value: "PEYZAJ_TAS_USTASI", label: "Peyzaj Taş Ustası" },
          { value: "CEVRE_DUZENLEME_USTASI", label: "Çevre Düzenleme Ustası" },
        ],
      },
    ],
  },
];

const seen = new Map<string, TradeProfession>();
for (const field of TRADE_FIELDS) {
  for (const branch of field.branches) {
    for (const profession of branch.professions) {
      if (!seen.has(profession.value)) seen.set(profession.value, profession);
    }
  }
}

/** Geriye dönük uyumluluk: düz meslek listesi (value+label), her meslek tek kez. */
export const TRADE_CATEGORIES: TradeProfession[] = Array.from(seen.values());

export const TRADE_CATEGORY_VALUES = TRADE_CATEGORIES.map((t) => t.value) as [string, ...string[]];
