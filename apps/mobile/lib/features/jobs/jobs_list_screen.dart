import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../models/job.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_dropdown.dart';
import '../../widgets/province_district_picker.dart';
import '../equipment/equipment_list_screen.dart';
import '../material_listings/material_listings_screen.dart';
import 'job_detail_screen.dart';

class JobsListScreen extends StatefulWidget {
  const JobsListScreen({super.key});

  @override
  State<JobsListScreen> createState() => _JobsListScreenState();
}

class _JobsListScreenState extends State<JobsListScreen> {
  final _api = ApiClient();
  String _tradeCategory = '';
  String _city = '';
  String _district = '';

  bool _isLoading = true;
  String? _error;
  List<JobPosting> _jobs = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final raw = await _api.get('/jobs', query: {
        if (_tradeCategory.isNotEmpty) 'tradeCategory': _tradeCategory,
        if (_city.isNotEmpty) 'city': _city,
        if (_district.isNotEmpty) 'district': _district,
      });
      final map = raw as Map<String, dynamic>;
      final items = (map['items'] as List).map((e) => JobPosting.fromJson(e as Map<String, dynamic>)).toList();
      setState(() => _jobs = items);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = context.read<LocaleStore>().t('jobs.connectionError'));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return Scaffold(
      appBar: AppBar(
        title: Text(t('jobs.list.title')),
        actions: [
          IconButton(
            tooltip: t('jobs.list.equipmentTooltip'),
            icon: const Icon(Icons.construction_outlined),
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const EquipmentListScreen()),
            ),
          ),
          IconButton(
            tooltip: t('jobs.list.materialTooltip'),
            icon: const Icon(Icons.storefront_outlined),
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const MaterialListingsScreen()),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          AppDropdown(
            label: t('jobs.list.tradeLabel'),
            value: _tradeCategory,
            options: [Option('', t('jobs.list.allTrades')), ...tradeCategories],
            onChanged: (v) {
              setState(() => _tradeCategory = v);
              _load();
            },
          ),
          ProvinceDistrictPicker(
            city: _city,
            district: _district,
            allowEmptyCity: true,
            allowEmptyDistrict: true,
            onCityChanged: (v) {
              setState(() {
                _city = v;
                _district = '';
              });
              _load();
            },
            onDistrictChanged: (v) {
              setState(() => _district = v);
              _load();
            },
          ),
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(24),
              child: Center(child: CircularProgressIndicator(color: AppColors.gold500)),
            ),
          if (!_isLoading && _error != null)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Text(_error!, style: const TextStyle(color: AppColors.red400)),
            ),
          if (!_isLoading && _error == null && _jobs.isEmpty)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Text(t('jobs.list.empty'), style: const TextStyle(color: AppColors.silver500)),
            ),
          ..._jobs.map(
            (job) => Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                title: Text(job.title, style: Theme.of(context).textTheme.titleMedium),
                subtitle: Text(
                  '${job.companyName} · ${job.city}${job.district != null ? ' / ${job.district}' : ''}',
                  style: const TextStyle(color: AppColors.silver500),
                ),
                trailing: const Icon(Icons.chevron_right, color: AppColors.silver500),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => JobDetailScreen(id: job.id)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}