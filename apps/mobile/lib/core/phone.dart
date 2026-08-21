String _normalizeTurkishPhone(String raw) {
  final digits = raw.replaceAll(RegExp(r'\D'), '');
  var local = digits;
  if (local.startsWith('90') && local.length > 10) local = local.substring(2);
  if (local.startsWith('0')) local = local.substring(1);
  return local;
}

/// Görüntüleme için: "0555 *** ** 22" — sayfa/ekran kaynağında numarayı açık bırakmaz.
String maskPhone(String raw) {
  final local = _normalizeTurkishPhone(raw);
  if (local.length != 10) return raw;
  final first3 = local.substring(0, 3);
  final last2 = local.substring(8, 10);
  return '0$first3 *** ** $last2';
}

/// wa.me linki için ülke koduyla birlikte boşluksuz uluslararası format.
String toWhatsAppPhone(String raw) {
  final local = _normalizeTurkishPhone(raw);
  return '90$local';
}