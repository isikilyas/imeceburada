import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../models/equipment_listing.dart';
import '../../models/favorite.dart';
import '../../models/job.dart';
import '../../models/material_listing.dart';
import '../../models/site_request.dart';
import '../../theme/app_theme.dart';
import '../equipment/equipment_detail_screen.dart';
import '../jobs/job_detail_screen.dart';
import '../material_listings/material_listing_detail_screen.dart';
import '../site_radar/site_request_detail_screen.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  bool _isLoading = true;
  String? _error;
  List<JobPosting> _jobs = [];
  List<EquipmentListing> _equipment = [];
  List<MaterialListing> _materials = [];
  List<SiteRequest> _siteRequests = [];

  @override
  void initState() {
    super.initState();
    if (context.read<AuthStore>().isAuthenticated) _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final auth = context.read<AuthStore>();
      final raw = await auth.authorizedGet('/favorites');
      final favorites = (raw as List).map((e) => Favorite.fromJson(e as Map<String, dynamic>)).toList();

      final jobs = await _fetchAll(auth, favorites, 'JOB', '/jobs', JobPosting.fromJson);
      final equipment = await _fetchAll(auth, favorites, 'EQUIPMENT', '/equipment', EquipmentListing.fromJson);
      final materials =
          await _fetchAll(auth, favorites, 'MATERIAL_LISTING', '/material-listings', MaterialListing.fromJson);
      final siteRequests =
          await _fetchAll(auth, favorites, 'SITE_REQUEST', '/site-requests', SiteRequest.fromJson);

      if (mounted) {
        setState(() {
          _jobs = jobs;
          _equipment = equipment;
          _materials = materials;
          _siteRequests = siteRequests;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _error = context.read<LocaleStore>().t('favorites.loadError'));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<List<T>> _fetchAll<T>(
    AuthStore auth,
    List<Favorite> favorites,
    String listingType,
    String basePath,
    T Function(Map<String, dynamic>) fromJson,
  ) async {
    final ids = favorites.where((f) => f.listingType == listingType).map((f) => f.listingId);
    final results = await Future.wait(ids.map((id) async {
      try {
        final raw = await auth.authorizedGet('$basePath/$id');
        return fromJson(raw as Map<String, dynamic>);
      } catch (_) {
        return null;
      }
    }));
    return results.whereType<T>().toList();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    final auth = context.watch<AuthStore>();
    final isEmpty = _jobs.isEmpty && _equipment.isEmpty && _materials.isEmpty && _siteRequests.isEmpty;

    return Scaffold(
      appBar: AppBar(title: Text(t('favorites.title'))),
      body: !auth.isAuthenticated
          ? Center(
              child: Text(t('favorites.loginRequired'), style: const TextStyle(color: AppColors.silver500)),
            )
          : _isLoading
              ? const Center(child: CircularProgressIndicator(color: AppColors.gold500))
              : _error != null
                  ? Center(child: Text(_error!, style: const TextStyle(color: AppColors.red400)))
                  : isEmpty
                      ? Center(child: Text(t('favorites.empty'), style: const TextStyle(color: AppColors.silver500)))
                      : ListView(
                          padding: const EdgeInsets.all(16),
                          children: [
                            if (_jobs.isNotEmpty) ...[
                              Text(t('jobs.list.title'), style: Theme.of(context).textTheme.titleMedium),
                              const SizedBox(height: 8),
                              ..._jobs.map((job) => Card(
                                    margin: const EdgeInsets.only(bottom: 10),
                                    child: ListTile(
                                      title: Text(job.title),
                                      subtitle: Text('${job.companyName} · ${job.city}'),
                                      trailing: const Icon(Icons.chevron_right, color: AppColors.silver500),
                                      onTap: () => Navigator.of(context).push(
                                        MaterialPageRoute(builder: (_) => JobDetailScreen(id: job.id)),
                                      ),
                                    ),
                                  )),
                              const SizedBox(height: 16),
                            ],
                            if (_equipment.isNotEmpty) ...[
                              Text(t('equipment.list.title'), style: Theme.of(context).textTheme.titleMedium),
                              const SizedBox(height: 8),
                              ..._equipment.map((listing) => Card(
                                    margin: const EdgeInsets.only(bottom: 10),
                                    child: ListTile(
                                      title: Text(equipmentTypes.labelFor(listing.equipmentType)),
                                      subtitle: Text(listing.city),
                                      trailing: const Icon(Icons.chevron_right, color: AppColors.silver500),
                                      onTap: () => Navigator.of(context).push(
                                        MaterialPageRoute(builder: (_) => EquipmentDetailScreen(id: listing.id)),
                                      ),
                                    ),
                                  )),
                              const SizedBox(height: 16),
                            ],
                            if (_materials.isNotEmpty) ...[
                              Text(t('materialListings.list.title'), style: Theme.of(context).textTheme.titleMedium),
                              const SizedBox(height: 8),
                              ..._materials.map((listing) => Card(
                                    margin: const EdgeInsets.only(bottom: 10),
                                    child: ListTile(
                                      title: Text(materialTypes.labelFor(listing.materialType)),
                                      subtitle: Text('${listing.supplierName} · ${listing.city}'),
                                      trailing: const Icon(Icons.chevron_right, color: AppColors.silver500),
                                      onTap: () => Navigator.of(context).push(
                                        MaterialPageRoute(builder: (_) => MaterialListingDetailScreen(id: listing.id)),
                                      ),
                                    ),
                                  )),
                              const SizedBox(height: 16),
                            ],
                            if (_siteRequests.isNotEmpty) ...[
                              Text(t('siteRadar.screenTitle'), style: Theme.of(context).textTheme.titleMedium),
                              const SizedBox(height: 8),
                              ..._siteRequests.map((request) => Card(
                                    margin: const EdgeInsets.only(bottom: 10),
                                    child: ListTile(
                                      title: Text(request.title),
                                      subtitle: Text(request.city),
                                      trailing: const Icon(Icons.chevron_right, color: AppColors.silver500),
                                      onTap: () => Navigator.of(context).push(
                                        MaterialPageRoute(builder: (_) => SiteRequestDetailScreen(id: request.id)),
                                      ),
                                    ),
                                  )),
                            ],
                          ],
                        ),
    );
  }
}
