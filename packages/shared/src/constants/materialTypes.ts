export interface MaterialTypeDef {
  value: string;
  label: string;
  unit: string;
}

export const MATERIAL_TYPES: MaterialTypeDef[] = [
  // Kaba inşaat
  { value: "DEMIR", label: "İnşaat Demiri", unit: "TON" },
  { value: "BETON_C30", label: "Hazır Beton (C30)", unit: "M3" },
  { value: "CIMENTO", label: "Çimento", unit: "TORBA" },
  { value: "TUGLA", label: "Tuğla", unit: "ADET" },
  { value: "GAZBETON", label: "Gazbeton Blok", unit: "M3" },
  { value: "BRIKET", label: "Briket / Bims Blok", unit: "ADET" },
  { value: "KUM", label: "Kum", unit: "M3" },
  { value: "AGREGA", label: "Agrega (Mıcır)", unit: "M3" },
  { value: "DOLGU_MALZEMESI", label: "Dolgu Malzemesi (Hafriyat/Kırmataş)", unit: "M3" },
  { value: "HAZIR_HARC", label: "Hazır Harç (Sıva/Yapıştırma)", unit: "TORBA" },
  { value: "ALCI", label: "Alçı (Toz)", unit: "TORBA" },

  // İnce inşaat / kaplama
  { value: "ALCIPAN_LEVHA", label: "Alçıpan Levha", unit: "M2" },
  { value: "SERAMIK_FAYANS", label: "Seramik / Fayans", unit: "M2" },
  { value: "PARKE_LAMINAT", label: "Parke / Laminat", unit: "M2" },
  { value: "CEPHE_BOYASI", label: "İç / Dış Cephe Boyası", unit: "TENEKE" },
  { value: "MANTOLAMA_LEVHASI", label: "Mantolama Levhası (EPS/XPS)", unit: "M2" },
  { value: "SU_YALITIM_MEMBRANI", label: "Su Yalıtım Membranı", unit: "M2" },

  // Tesisat
  { value: "PPRC_BORU", label: "PPRC Boru (Sıhhi Tesisat)", unit: "METRE" },
  { value: "ELEKTRIK_KABLOSU", label: "Elektrik Kablosu (NYA/NYM)", unit: "METRE" },
];

export const MATERIAL_TYPE_VALUES = MATERIAL_TYPES.map((m) => m.value);

export function getMaterialUnit(materialType: string): string {
  return MATERIAL_TYPES.find((m) => m.value === materialType)?.unit ?? "";
}