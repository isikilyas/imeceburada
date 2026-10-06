import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/locale_store.dart';
import '../theme/app_theme.dart';

void openLanguagePicker(BuildContext context, LocaleStore store) {
  final t = store.t;
  showModalBottomSheet(
    context: context,
    backgroundColor: AppColors.ink900,
    builder: (_) => SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ...availableLocales.map(
            (l) => ListTile(
              leading: Text(l.flag, style: const TextStyle(fontSize: 20)),
              title: Text(l.label, style: const TextStyle(color: AppColors.silver300)),
              trailing: l.code == store.locale ? const Icon(Icons.check, color: AppColors.gold500) : null,
              onTap: () {
                store.setLocale(l.code);
                Navigator.of(context).pop();
              },
            ),
          ),
          const Divider(color: AppColors.ink800, height: 1),
          ...comingSoonLocales.map(
            (l) => ListTile(
              enabled: false,
              leading: Text(l.flag, style: const TextStyle(fontSize: 20)),
              title: Text(l.label, style: const TextStyle(color: AppColors.silver500)),
              trailing: Text(t('widgets.languageSwitcher.comingSoon'), style: const TextStyle(color: AppColors.silver500, fontSize: 12)),
            ),
          ),
        ],
      ),
    ),
  );
}

class LanguageSwitcher extends StatelessWidget {
  const LanguageSwitcher({super.key});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<LocaleStore>();
    final t = store.t;
    final current = availableLocales.firstWhere((l) => l.code == store.locale);

    return ListTile(
      leading: Text(current.flag, style: const TextStyle(fontSize: 20)),
      title: Text(t('widgets.languageSwitcher.title'), style: const TextStyle(color: AppColors.silver300)),
      subtitle: Text(current.label, style: const TextStyle(color: AppColors.silver500)),
      trailing: const Icon(Icons.chevron_right, color: AppColors.silver500),
      onTap: () => openLanguagePicker(context, store),
    );
  }
}

/// Kompakt, sadece bayrak gösteren buton — ana sayfa başlığı gibi dar
/// alanlarda [LanguageSwitcher]'ın tam satırlık hâli yerine kullanılır.
class LanguageFlagButton extends StatelessWidget {
  const LanguageFlagButton({super.key});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<LocaleStore>();
    final current = availableLocales.firstWhere((l) => l.code == store.locale);

    return Material(
      color: AppColors.ink900,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: () => openLanguagePicker(context, store),
        child: Container(
          width: 40,
          height: 40,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.ink700),
          ),
          child: Text(current.flag, style: const TextStyle(fontSize: 18)),
        ),
      ),
    );
  }
}