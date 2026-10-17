import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
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
        labelKey: authUser?.role == 'CANDIDATE' ? 'jobs.applications.title' : 'home.searchOptionCreateListing',
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
                  const SizedBox(height: 28),
                  const FadeInUp(delay: Duration(milliseconds: 260), child: _PlatformStats()),
                  const SizedBox(height: 32),
                  const FadeInUp(delay: Duration(milliseconds: 320), child: _HowItWorks()),
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

/// Ana sayfada web'deki "Platformda Şu An" paneliyle eşleşen canlı sayaçlar.
class _PlatformStats extends StatefulWidget {
  const _PlatformStats();

  @override
  State<_PlatformStats> createState() => _PlatformStatsState();
}

class _PlatformStatsState extends State<_PlatformStats> {
  final _api = ApiClient();
  late final Future<List<int>> _future = _loadTotals();

  Future<List<int>> _loadTotals() async {
    try {
      final results = await Future.wait([
        _api.get('/jobs', query: {'pageSize': '1'}),
        _api.get('/equipment', query: {'pageSize': '1'}),
        _api.get('/material-listings', query: {'pageSize': '1'}),
      ]);
      return results.map((r) => ((r as Map)['total'] as num?)?.toInt() ?? 0).toList();
    } catch (_) {
      return const [0, 0, 0];
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return FutureBuilder<List<int>>(
      future: _future,
      builder: (context, snapshot) {
        final totals = snapshot.data ?? const [0, 0, 0];
        return Container(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 8),
          decoration: BoxDecoration(
            color: AppColors.ink900.withValues(alpha: 0.6),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.ink700),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 7,
                    height: 7,
                    decoration: const BoxDecoration(color: Color(0xFF34D399), shape: BoxShape.circle),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    t('home.statsHeading'),
                    style: const TextStyle(
                      color: AppColors.silver500,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.6,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                childAspectRatio: 1.7,
                children: [
                  _StatTile(icon: Icons.work_outline, value: totals[0], label: t('home.statJobs')),
                  _StatTile(icon: Icons.construction_outlined, value: totals[1], label: t('home.statEquipment')),
                  _StatTile(icon: Icons.inventory_2_outlined, value: totals[2], label: t('home.statMaterials')),
                  _StatTile(icon: Icons.map_outlined, value: 81, label: t('home.statProvinces')),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _StatTile extends StatelessWidget {
  final IconData icon;
  final int value;
  final String label;

  const _StatTile({required this.icon, required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 36,
          height: 36,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.gold500.withValues(alpha: 0.1),
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.gold500.withValues(alpha: 0.25)),
          ),
          child: Icon(icon, color: AppColors.gold400, size: 17),
        ),
        const SizedBox(height: 6),
        Text(
          '$value',
          style: const TextStyle(color: AppColors.gold400, fontSize: 20, fontWeight: FontWeight.w700),
        ),
        Text(
          label,
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(color: AppColors.silver500, fontSize: 10),
        ),
      ],
    );
  }
}

/// Ana sayfadaki "Nasıl Çalışır" 3 adımlık anlatım bloğu — web'deki karşılığıyla aynı metinler.
class _HowItWorks extends StatelessWidget {
  const _HowItWorks();

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    final steps = [
      ('01', t('home.step1Title'), t('home.step1Desc')),
      ('02', t('home.step2Title'), t('home.step2Desc')),
      ('03', t('home.step3Title'), t('home.step3Desc')),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          t('home.howItWorks'),
          style: const TextStyle(color: AppColors.silver300, fontSize: 18, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 18),
        for (final step in steps)
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 36,
                  height: 36,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.gold500),
                  ),
                  child: Text(
                    step.$1,
                    style: const TextStyle(color: AppColors.gold400, fontWeight: FontWeight.w700, fontSize: 13),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        step.$2,
                        style: const TextStyle(color: AppColors.silver300, fontWeight: FontWeight.w600, fontSize: 14.5),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        step.$3,
                        style: const TextStyle(color: AppColors.silver500, fontSize: 12.5, height: 1.4),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
