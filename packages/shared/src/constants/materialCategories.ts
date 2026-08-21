export interface MaterialCategoryItem {
  value: string;
  label: string;
}

export interface MaterialCategory {
  icon: string;
  label: string;
  items: MaterialCategoryItem[];
}

/**
 * "Yapı Tedarik" firmalarının profillerinde beyan ettiği geniş tedarik
 * kategorileri — malzeme satışıyla sınırlı değil, hafriyat/nakliye/iş makinesi
 * gibi tedarik zinciri hizmetlerini de kapsar. Fiyat girilen tekil malzeme
 * ilanları (`MATERIAL_TYPES`, birim fiyatlı) için ayrı bir listedir.
 */
export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  {
    icon: "🪨",
    label: "Temel ve Altyapı Malzemeleri",
    items: [
      { value: "DOLGU_MALZEMELERI", label: "Dolgu malzemeleri" },
      { value: "ALT_TEMEL_MALZEMELERI", label: "Alt temel malzemeleri" },
      { value: "STABILIZE", label: "Stabilize" },
      { value: "MICIR", label: "Mıcır" },
      { value: "KIRMATAS", label: "Kırmataş" },
      { value: "AGREGA", label: "Agrega" },
      { value: "KUM", label: "Kum" },
      { value: "CAKIL", label: "Çakıl" },
      { value: "HAFRIYAT_MALZEMELERI", label: "Hafriyat malzemeleri" },
      { value: "OCAK_MALZEMELERI", label: "Ocak malzemeleri" },
    ],
  },
  {
    icon: "🚜",
    label: "Hafriyat ve Nakliye",
    items: [
      { value: "HAFRIYAT_HIZMETI", label: "Hafriyat hizmeti" },
      { value: "KAMYON", label: "Kamyon" },
      { value: "DAMPERLI_KAMYON", label: "Damperli kamyon" },
      { value: "IS_MAKINESI", label: "İş makinesi" },
      { value: "EKSKAVATOR", label: "Ekskavatör" },
      { value: "KEPCE", label: "Kepçe" },
      { value: "JCB", label: "JCB" },
      { value: "DOZER", label: "Dozer" },
      { value: "GREYDER", label: "Greyder" },
      { value: "SILINDIR", label: "Silindir" },
      { value: "HAFRIYAT_TASIMA_HIZMETLERI", label: "Hafriyat taşıma hizmetleri" },
    ],
  },
  {
    icon: "🏗️",
    label: "Kaba Yapı Malzemeleri",
    items: [
      { value: "INSAAT_DEMIRI", label: "İnşaat demiri" },
      { value: "HASIR_CELIK", label: "Hasır çelik" },
      { value: "BETON", label: "Beton" },
      { value: "CIMENTO", label: "Çimento" },
      { value: "TUGLA", label: "Tuğla" },
      { value: "GAZBETON", label: "Gazbeton" },
      { value: "BIMS", label: "Bims" },
      { value: "KALIP_MALZEMELERI", label: "Kalıp malzemeleri" },
      { value: "KERESTE", label: "Kereste" },
      { value: "PLYWOOD", label: "Plywood" },
      { value: "ISKELE", label: "İskele" },
      { value: "KALIP_SISTEMLERI", label: "Kalıp sistemleri" },
    ],
  },
  {
    icon: "🧱",
    label: "İnce Yapı Malzemeleri",
    items: [
      { value: "FAYANS", label: "Fayans" },
      { value: "SERAMIK", label: "Seramik" },
      { value: "MERMER", label: "Mermer" },
      { value: "BOYA", label: "Boya" },
      { value: "ALCI", label: "Alçı" },
      { value: "ALCIPAN", label: "Alçıpan" },
      { value: "SAP_MALZEMELERI", label: "Şap malzemeleri" },
      { value: "YAPISTIRICILAR", label: "Yapıştırıcılar" },
      { value: "DERZ_MALZEMELERI", label: "Derz malzemeleri" },
    ],
  },
  {
    icon: "🚰",
    label: "Mekanik Tesisat Malzemeleri",
    items: [
      { value: "BORU", label: "Boru" },
      { value: "PPRC", label: "PPRC" },
      { value: "PVC_MALZEME", label: "PVC" },
      { value: "VANA", label: "Vana" },
      { value: "POMPA", label: "Pompa" },
      { value: "ARMATUR", label: "Armatür" },
      { value: "RADYATOR", label: "Radyatör" },
      { value: "YANGIN_TESISATI_MALZEMELERI", label: "Yangın tesisatı malzemeleri" },
      { value: "HAVALANDIRMA_MALZEMELERI", label: "Havalandırma malzemeleri" },
    ],
  },
  {
    icon: "⚡",
    label: "Elektrik Malzemeleri",
    items: [
      { value: "KABLO", label: "Kablo" },
      { value: "PANO", label: "Pano" },
      { value: "SIGORTA", label: "Sigorta" },
      { value: "PRIZ", label: "Priz" },
      { value: "ANAHTAR", label: "Anahtar" },
      { value: "AYDINLATMA", label: "Aydınlatma" },
      { value: "ZAYIF_AKIM_MALZEMELERI", label: "Zayıf akım malzemeleri" },
      { value: "KAMERA_GUVENLIK_SISTEMLERI", label: "Kamera ve güvenlik sistemleri" },
    ],
  },
];

const seenMaterialCategoryItems = new Map<string, MaterialCategoryItem>();
for (const category of MATERIAL_CATEGORIES) {
  for (const item of category.items) {
    if (!seenMaterialCategoryItems.has(item.value)) seenMaterialCategoryItems.set(item.value, item);
  }
}

export const MATERIAL_CATEGORY_ITEMS: MaterialCategoryItem[] = Array.from(seenMaterialCategoryItems.values());

export const MATERIAL_CATEGORY_ITEM_VALUES = MATERIAL_CATEGORY_ITEMS.map((i) => i.value) as [string, ...string[]];