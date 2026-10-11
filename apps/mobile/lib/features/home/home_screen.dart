import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/auth_store.dart';
import '../../core/locale_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/fade_in_up.dart';
import '../../widgets/language_switcher.dart';
import '../auth/register_screen.dart';
import '../candidates/candidate_directory_screen.dart';
import '../equipment/equipment_list_screen.dart';
import '../jobs/company_jobs_screen.dart';
import '../jobs/my_applications_screen.dart';
import '../material_listings/material_listings_screen.dart';
import '../material_listings/supplier_dashboard_screen.dart';
import '../subcontractors/subcontractor_dashboard_screen.dart';
import '../subcontractors/subcontractor_directory_screen.dart';
import '../weather/weather_screen.dart';

class _HomeCard {
  final IconData icon;
  final String titleKey;
  final String descKey;
  final VoidCallback onTap;
  const _HomeCard({required this.icon, required this.titleKey, required this.descKey, required this.onTap});
}

class _SearchOption {
  final IconData icon;
  final String labelKey;
  final VoidCallback onTap;
  const _SearchOption({required this.icon, required this.labelKey, required this.onTap});
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
    final authUser = context.watch<AuthStore>().user;

    // Bu beş hedef (iş ilanları/eleman/taşeron/ekipman/malzeme) aşağıdaki
    // arama çubuğunda zaten var — kart grid'inde tekrar etmesin diye burada
    // sadece aramada OLMAYAN hedefler kart olarak listeleniyor.
    final cards = <_HomeCard>[
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

    final VoidCallback createListingTap = switch (authUser?.role) {
      'COMPANY' => () => Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const CompanyJobsScreen()),
          ),
      'SUPPLIER' => () => Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const SupplierDashboardScreen()),
          ),
      'SUBCONTRACTOR' => () => Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const SubcontractorDashboardScreen()),
          ),
      'CANDIDATE' => () => Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const MyApplicationsScreen()),
          ),
      _ => () => Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const RegisterScreen()),
          ),
    };

    final searchOptions = <_SearchOption>[
      _SearchOption(
        icon: Icons.edit_note,
        labelKey: 'home.searchOptionCreateListing',
        onTap: createListingTap,
      ),
      _SearchOption(
        icon: Icons.work_outline,
        labelKey: 'home.searchOptionJobs',
        onTap: () => onNavigateTab(2),
      ),
      _SearchOption(
        icon: Icons.engineering_outlined,
        labelKey: 'home.searchOptionCandidates',
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const CandidateDirectoryScreen()),
        ),
      ),
      _SearchOption(
        icon: Icons.apartment_outlined,
        labelKey: 'home.searchOptionSubcontractors',
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const SubcontractorDirectoryScreen()),
        ),
      ),
      _SearchOption(
        icon: Icons.construction_outlined,
        labelKey: 'home.searchOptionEquipment',
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const EquipmentListScreen()),
        ),
      ),
      _SearchOption(
        icon: Icons.inventory_2_outlined,
        labelKey: 'home.searchOptionMaterials',
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const MaterialListingsScreen()),
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
                  const SizedBox(height: 10),
                  FadeInUp(
                    delay: const Duration(milliseconds: 100),
                    child: _QuickSearchBar(
                      placeholder: t('home.searchBarPlaceholder'),
                      onTap: () => _showQuickSearchSheet(context, t, searchOptions),
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

void _showQuickSearchSheet(
  BuildContext context,
  String Function(String) t,
  List<_SearchOption> options,
) {
  showModalBottomSheet(
    context: context,
    backgroundColor: AppColors.ink900,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
    builder: (sheetContext) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(color: AppColors.ink700, borderRadius: BorderRadius.circular(2)),
            ),
            for (final opt in options)
              ListTile(
                leading: Icon(opt.icon, color: AppColors.gold400),
                title: Text(
                  t(opt.labelKey),
                  style: const TextStyle(color: AppColors.silver300, fontWeight: FontWeight.w600, fontSize: 15),
                ),
                onTap: () {
                  Navigator.of(sheetContext).pop();
                  opt.onTap();
                },
              ),
          ],
        ),
      ),
    ),
  );
}

class _QuickSearchBar extends StatelessWidget {
  final String placeholder;
  final VoidCallback onTap;

  const _QuickSearchBar({required this.placeholder, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.ink900,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.ink700),
          ),
          child: Row(
            children: [
              const Icon(Icons.search, color: AppColors.gold400, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  placeholder,
                  style: const TextStyle(color: AppColors.silver500, fontSize: 14),
                ),
              ),
            ],
          ),
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
