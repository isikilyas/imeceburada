import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'i18n/dictionaries/auth.dart';
import 'i18n/dictionaries/candidates.dart';
import 'i18n/dictionaries/equipment.dart';
import 'i18n/dictionaries/home.dart';
import 'i18n/dictionaries/jobs.dart';
import 'i18n/dictionaries/market_index.dart';
import 'i18n/dictionaries/material_listings.dart';
import 'i18n/dictionaries/membership.dart';
import 'i18n/dictionaries/profile.dart';
import 'i18n/dictionaries/site_radar.dart';
import 'i18n/dictionaries/subcontractors.dart';
import 'i18n/dictionaries/weather.dart';
import 'i18n/dictionaries/widgets.dart';

const _storageKey = 'bau360.locale';

const List<String> supportedLocaleCodes = ['tr', 'en', 'de', 'ru', 'ar', 'es', 'fr'];

const Map<String, Map<String, String>> _core = {
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
  'de': {
    'nav.market': 'Markt',
    'nav.listings': 'Anzeigen',
    'nav.radar': 'Radar',
    'nav.profile': 'Profil',
  },
  'ru': {
    'nav.market': 'Рынок',
    'nav.listings': 'Объявления',
    'nav.radar': 'Радар',
    'nav.profile': 'Профиль',
  },
  'ar': {
    'nav.market': 'السوق',
    'nav.listings': 'الإعلانات',
    'nav.radar': 'الرادار',
    'nav.profile': 'الملف الشخصي',
  },
  'es': {
    'nav.market': 'Mercado',
    'nav.listings': 'Anuncios',
    'nav.radar': 'Radar',
    'nav.profile': 'Perfil',
  },
  'fr': {
    'nav.market': 'Marché',
    'nav.listings': 'Annonces',
    'nav.radar': 'Radar',
    'nav.profile': 'Profil',
  },
};

/// Tüm alt-sözlükleri (her biri kendi feature klasörüne ait, paralel olarak
/// çevrilmiş) tek bir dil -> anahtar haritasında birleştirir.
Map<String, Map<String, String>> _mergeDicts() {
  final result = <String, Map<String, String>>{};
  final allDicts = [
    _core,
    authDict,
    candidatesDict,
    equipmentDict,
    homeDict,
    jobsDict,
    marketIndexDict,
    materialListingsDict,
    membershipDict,
    profileDict,
    siteRadarDict,
    subcontractorsDict,
    weatherDict,
    widgetsDict,
  ];
  for (final code in supportedLocaleCodes) {
    final merged = <String, String>{};
    for (final dict in allDicts) {
      final part = dict[code];
      if (part != null) merged.addAll(part);
    }
    result[code] = merged;
  }
  return result;
}

final Map<String, Map<String, String>> _translations = _mergeDicts();

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
  LocaleOption('de', 'Deutsch', '🇩🇪'),
  LocaleOption('ru', 'Русский', '🇷🇺'),
  LocaleOption('ar', 'العربية', '🇸🇦'),
  LocaleOption('es', 'Español', '🇪🇸'),
  LocaleOption('fr', 'Français', '🇫🇷'),
];

const List<LocaleOption> comingSoonLocales = [];

class LocaleStore extends ChangeNotifier {
  String _locale = 'tr';
  String get locale => _locale;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString(_storageKey);
    if (stored != null && supportedLocaleCodes.contains(stored)) {
      _locale = stored;
      notifyListeners();
    }
  }

  Future<void> setLocale(String next) async {
    _locale = next;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, next);
  }

  /// [vars] verilirse çeviri metnindeki `{{ad}}` yer tutucuları değerleriyle
  /// değiştirilir (örn. `t('mine.count', vars: {'count': '3'})`).
  String t(String key, {Map<String, String>? vars}) {
    final raw = _translations[_locale]?[key] ?? key;
    if (vars == null) return raw;
    var result = raw;
    for (final entry in vars.entries) {
      result = result.replaceAll('{{${entry.key}}}', entry.value);
    }
    return result;
  }
}
