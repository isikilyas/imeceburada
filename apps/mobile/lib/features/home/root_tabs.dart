import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../market_index/market_index_screen.dart';
import '../jobs/jobs_list_screen.dart';
import '../site_radar/site_radar_screen.dart';
import '../profile/profile_screen.dart';
import '../../core/locale_store.dart';
import '../../theme/app_theme.dart';

/// Faz 1 mobil kapsamı tamamlandı: Piyasa, İlanlar, Radar ve Profil
/// sekmelerinin hepsi işlevsel.
class RootTabs extends StatefulWidget {
  const RootTabs({super.key});

  @override
  State<RootTabs> createState() => _RootTabsState();
}

class _RootTabsState extends State<RootTabs> {
  int _index = 0;

  static const _screens = [
    MarketIndexScreen(),
    JobsListScreen(),
    SiteRadarScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return Scaffold(
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
        backgroundColor: AppColors.ink900,
        items: [
          BottomNavigationBarItem(icon: const Icon(Icons.show_chart), label: t('nav.market')),
          BottomNavigationBarItem(icon: const Icon(Icons.work_outline), label: t('nav.listings')),
          BottomNavigationBarItem(icon: const Icon(Icons.map_outlined), label: t('nav.radar')),
          BottomNavigationBarItem(icon: const Icon(Icons.person_outline), label: t('nav.profile')),
        ],
      ),
    );
  }
}