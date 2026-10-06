import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'home_screen.dart';
import '../market_index/market_index_screen.dart';
import '../jobs/jobs_list_screen.dart';
import '../site_radar/site_radar_screen.dart';
import '../profile/profile_screen.dart';
import '../../core/locale_store.dart';
import '../../theme/app_theme.dart';

/// Faz 1 mobil kapsamı tamamlandı: Ana Sayfa, Piyasa, İlanlar, Radar ve
/// Profil sekmelerinin hepsi işlevsel.
class RootTabs extends StatefulWidget {
  const RootTabs({super.key});

  @override
  State<RootTabs> createState() => _RootTabsState();
}

class _RootTabsState extends State<RootTabs> {
  int _index = 0;

  void _goToTab(int index) => setState(() => _index = index);

  late final _screens = [
    HomeScreen(onNavigateTab: _goToTab),
    const MarketIndexScreen(),
    const JobsListScreen(),
    const SiteRadarScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return Scaffold(
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: _goToTab,
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppColors.ink900,
        selectedFontSize: 11.5,
        unselectedFontSize: 11.5,
        items: [
          BottomNavigationBarItem(icon: const Icon(Icons.home_outlined), label: t('nav.home')),
          BottomNavigationBarItem(icon: const Icon(Icons.show_chart), label: t('nav.market')),
          BottomNavigationBarItem(icon: const Icon(Icons.work_outline), label: t('nav.listings')),
          BottomNavigationBarItem(icon: const Icon(Icons.map_outlined), label: t('nav.radar')),
          BottomNavigationBarItem(icon: const Icon(Icons.person_outline), label: t('nav.profile')),
        ],
      ),
    );
  }
}