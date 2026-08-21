/** "+90 555 123 45 22", "05551234522", "5551234522" gibi girdileri 10 haneli yerel numaraya indirger. */
function normalizeTurkishPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("90") && local.length > 10) local = local.slice(2);
  if (local.startsWith("0")) local = local.slice(1);
  return local;
}

/** Görüntüleme için: "0555 *** ** 22" — ortadaki haneleri maskeler, numarayı sayfa kaynağında açık bırakmaz. */
export function maskPhone(raw: string): string {
  const local = normalizeTurkishPhone(raw);
  if (local.length !== 10) return raw;
  const first3 = local.slice(0, 3);
  const last2 = local.slice(8, 10);
  return `0${first3} *** ** ${last2}`;
}

/** wa.me linki için: ülke koduyla birlikte, boşluksuz uluslararası format (ör. 905551234522). */
export function toWhatsAppPhone(raw: string): string {
  const local = normalizeTurkishPhone(raw);
  return `90${local}`;
}