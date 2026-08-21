import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _storageKey = 'bau360.locale';

/// Şu an sadece TR/EN çevrilmiş — DE/RU/AR web'deki dropdown'da olduğu gibi
/// "yakında" olarak gösterilir ama henüz çevrilmedi. Kapsam bilinçli olarak
/// web'in ilk fazıyla aynı: sadece gezinme/ana çerçeve metinleri, tüm ekranlar
/// değil.
const Map<String, Map<String, String>> _translations = {
  'tr': {
    'nav.market': 'Piyasa',
    'nav.listings': 'İlanlar',
    'nav.radar': 'Radar',
    'nav.profile': 'Profil',
  },
  'en': {
    'nav.market': 'Market',
    'nav.listings': 'Listings',
    'nav.radar': 'Radar',
    'nav.profile': 'Profile',
  },
};

class LocaleOption {
  final String code;
  final String label;
  final String flag;
  final bool available;
  const LocaleOption(this.code, this.label, this.flag, {this.available = true});
}

const List<LocaleOption> availableLocales = [
  LocaleOption('tr', 'Türkçe', '🇹🇷'),
  LocaleOption('en', 'English', '🇬🇧'),
];

const List<LocaleOption> comingSoonLocales = [
  LocaleOption('de', 'Deutsch', '🇩🇪', available: false),
  LocaleOption('ru', 'Русский', '🇷🇺', available: false),
  LocaleOption('ar', 'العربية', '🇸🇦', available: false),
];

class LocaleStore extends ChangeNotifier {
  String _locale = 'tr';
  String get locale => _locale;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString(_storageKey);
    if (stored == 'tr' || stored == 'en') {
      _locale = stored!;
      notifyListeners();
    }
  }

  Future<void> setLocale(String next) async {
    _locale = next;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, next);
  }

  String t(String key) => _translations[_locale]?[key] ?? key;
}