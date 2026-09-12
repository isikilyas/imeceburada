import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../models/equipment_listing.dart';
import '../../models/job.dart';
import '../../models/material_listing.dart';
import '../../theme/app_theme.dart';
import '../equipment/equipment_detail_screen.dart';
import '../jobs/job_detail_screen.dart';
import '../material_listings/material_listing_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _api = ApiClient();
  final _controller = TextEditingController();
  Timer? _debounce;
  bool _isLoading = false;
  bool _hasSearched = false;
  List<JobPosting> _jobs = [];
  List<EquipmentListing> _equipment = [];
  List<MaterialListing> _materials = [];

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _onChanged(String query) {
    _debounce?.cancel();
    final trimmed = query.trim();
    if (trimmed.isEmpty) {
      setState(() {
        _hasSearched = false;
        _jobs = [];
        _equipment = [];
        _materials = [];
      });
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 400), () => _search(trimmed));
  }

  Future<void> _search(String query) async {
    setState(() {
      _isLoading = true;
      _hasSearched = true;
    });
    try {
      final results = await Future.wait([
        _api.get('/jobs', query: {'q': query, 'pageSize': '10'}),
        _api.get('/equipment', query: {'q': query, 'pageSize': '10'}),
        _api.get('/material-listings', query: {'q': query, 'pageSize': '10'}),
      ]);
      final jobs = ((results[0] as Map<String, dynamic>)['items'] as List)
          .map((e) => JobPosting.fromJson(e as Map<String, dynamic>))
          .toList();
      final equipment = ((results[1] as Map<String, dynamic>)['items'] as List)
          .map((e) => EquipmentListing.fromJson(e as Map<String, dynamic>))
          .toList();
      final materials = ((results[2] as Map<String, dynamic>)['items'] as List)
          .map((e) => MaterialListing.fromJson(e as Map<String, dynamic>))
          .toList();
      if (mounted) {
        setState(() {
          _jobs = jobs;
          _equipment = equipment;
          _materials = materials;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _jobs = [];
          _equipment = [];
          _materials = [];
        });
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    final totalResults = _jobs.length + _equipment.length + _materials.length;

    return Scaffold(
      appBar: AppBar(title: Text(t('search.title'))),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _controller,
              onChanged: _onChanged,
              autofocus: true,
              decoration: InputDecoration(hintText: t('search.hint'), prefixIcon: const Icon(Icons.search)),
            ),
            const SizedBox(height: 16),
            if (_isLoading)
              const Padding(
                padding: EdgeInsets.all(24),
                child: Center(child: CircularProgressIndicator(color: AppColors.gold500)),
              ),
            if (!_isLoading && !_hasSearched)
              Padding(
                padding: const EdgeInsets.all(12),
                child: Text(t('search.promptEmpty'), style: const TextStyle(color: AppColors.silver500)),
              ),
            if (!_isLoading && _hasSearched && totalResults == 0)
              Padding(
                padding: const EdgeInsets.all(12),
                child: Text(t('search.noResults'), style: const TextStyle(color: AppColors.silver500)),
              ),
            Expanded(
              child: ListView(
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
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
