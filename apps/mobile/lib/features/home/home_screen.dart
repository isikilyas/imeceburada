import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/locale_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/fade_in_up.dart';
import '../../widgets/language_switcher.dart';
import '../candidates/candidate_directory_screen.dart';
import '../equipment/equipment_list_screen.dart';
import '../material_listings/material_listings_screen.dart';
import '../subcontractors/subcontractor_directory_screen.dart';
import '../weather/weather_screen.dart';

class _HomeCard {
  final IconData icon;
  final String titleKey;
  final String descKey;
  final VoidCallback onTap;
  const _HomeCard({required this.icon, required this.titleKey, required this.descKey, required this.onTap});
}

/// Uygulamanın karşılama/ana ekranı — alt sekmelerdeki Piyasa/İlanlar/Radar'a
/// ek olarak, sekme çubuğunda yer almayan dizin ve hava durumu ekranlarına da
/// buradan tek dokunuşla ulaşılır.
class HomeScreen extends StatelessWidget {
  final void Function(int tabIndex) onNavigateTab;

  const HomeScreen({super.key, required this.onNavigateTab});

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;

    final cards = <_HomeCard>[
      _HomeCard(
        icon: Icons.work_outline,
        titleKey: 'home.jobsTitle',
        descKey: 'home.jobsDesc',
        onTap: () => onNavigateTab(2),
      ),
      _HomeCard(
        icon: Icons.engineering_outlined,
        titleKey: 'home.candidatesTitle',
        descKey: 'home.candidatesDesc',
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const CandidateDirectoryScreen()),
        ),
      ),
      _HomeCard(
        icon: Icons.apartment_outlined,
        titleKey: 'home.subcontractorsTitle',
        descKey: 'home.subcontractorsDesc',
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const SubcontractorDirectoryScreen()),
        ),
      ),
      _HomeCard(
        icon: Icons.construction_outlined,
        titleKey: 'home.equipmentTitle',
        descKey: 'home.equipmentDesc',
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const EquipmentListScreen()),
        ),
      ),
      _HomeCard(
        icon: Icons.inventory_2_outlined,
        titleKey: 'home.materialsTitle',
        descKey: 'home.materialsDesc',
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const MaterialListingsScreen()),
        ),
      ),
      _HomeCard(
        icon: Icons.map_outlined,
        titleKey: 'home.siteRadarTitle',
        descKey: 'home.siteRadarDesc',
        onTap: () => onNavigateTab(3),
      ),
      _HomeCard(
        icon: Icons.show_chart,
        titleKey: 'home.marketIndexTitle',
        descKey: 'home.marketIndexDesc',
        onTap: () => onNavigateTab(1),
      ),
      _HomeCard(
        icon: Icons.wb_sunny_outlined,
        titleKey: 'home.weatherTitle',
        descKey: 'home.weatherDesc',
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const WeatherScreen()),
        ),
      ),
    ];

    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: FadeInUp(child: _HeroHeader(tagline: t('home.tagline'))),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  FadeInUp(
                    delay: const Duration(milliseconds: 80),
                    child: Text(
                      t('home.sectionHeading'),
                      style: const TextStyle(
                        color: AppColors.silver300,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.98,
                    children: [
                      for (final entry in cards.asMap().entries)
                        FadeInUp(
                          delay: Duration(milliseconds: 120 + entry.key * 60),
                          child: _HomeCategoryCard(
                            icon: entry.value.icon,
                            title: t(entry.value.titleKey),
                            description: t(entry.value.descKey),
                            onTap: entry.value.onTap,
                          ),
                        ),
                    ],
                  ),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HeroHeader extends StatelessWidget {
  final String tagline;
  const _HeroHeader({required this.tagline});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(24, 32, 24, 36),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [AppColors.ink900, AppColors.ink950],
        ),
      ),
      child: Stack(
        alignment: Alignment.topCenter,
        children: [
          const Positioned(
            top: 0,
            right: 0,
            child: SafeArea(bottom: false, child: LanguageFlagButton()),
          ),
          Column(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Image.asset('assets/logo.png', height: 80, fit: BoxFit.contain),
              ),
              const SizedBox(height: 10),
              Container(
                width: 44,
                height: 3,
                decoration: BoxDecoration(
                  color: AppColors.gold500,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 18),
              Text(
                tagline,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.silver500, fontSize: 13.5, height: 1.5),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HomeCategoryCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final VoidCallback onTap;

  const _HomeCategoryCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.ink900,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.ink700),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40,
                height: 40,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.gold500.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.gold500.withValues(alpha: 0.25)),
                ),
                child: Icon(icon, color: AppColors.gold400, size: 20),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: const TextStyle(color: AppColors.silver300, fontWeight: FontWeight.w700, fontSize: 14.5),
              ),
              const SizedBox(height: 4),
              Expanded(
                child: Text(
                  description,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: AppColors.silver500, fontSize: 12, height: 1.35),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
