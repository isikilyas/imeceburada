import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../models/candidate_directory.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_dropdown.dart';
import '../../widgets/province_district_picker.dart';
import 'candidate_detail_screen.dart';

class CandidateDirectoryScreen extends StatefulWidget {
  const CandidateDirectoryScreen({super.key});

  @override
  State<CandidateDirectoryScreen> createState() => _CandidateDirectoryScreenState();
}

class _CandidateDirectoryScreenState extends State<CandidateDirectoryScreen> {
  String _tradeCategory = '';
  String _city = '';
  String _district = '';
  bool _isLoading = true;
  String? _error;
  List<CandidateDirectoryEntry> _candidates = [];

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
      final raw = await context.read<AuthStore>().authorizedGet('/candidates', query: {
        if (_tradeCategory.isNotEmpty) 'tradeCategory': _tradeCategory,
        if (_city.isNotEmpty) 'city': _city,
        if (_district.isNotEmpty) 'district': _district,
      });
      final map = raw as Map<String, dynamic>;
      final items =
          (map['items'] as List).map((e) => CandidateDirectoryEntry.fromJson(e as Map<String, dynamic>)).toList();
      setState(() => _candidates = items);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = context.read<LocaleStore>().t('candidates.connectionError'));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    final allTrades = Option('', t('candidates.directory.allTrades'));
    return Scaffold(
      appBar: AppBar(title: Text(t('candidates.directory.title'))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          AppDropdown(
            label: t('candidates.directory.tradeLabel'),
            value: _tradeCategory,
            options: [allTrades, ...tradeCategories],
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
          if (!_isLoading && _error == null && _candidates.isEmpty)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Text(t('candidates.directory.noResults'), style: const TextStyle(color: AppColors.silver500)),
            ),
          ..._candidates.map(
            (c) => Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                title: Row(
                  children: [
                    Expanded(child: Text(c.fullName, style: Theme.of(context).textTheme.titleMedium)),
                    Text(
                      c.availabilityStatus == 'AVAILABLE' ? '🟢' : '🔴',
                      style: const TextStyle(fontSize: 14),
                    ),
                  ],
                ),
                subtitle: Text(
                  t('candidates.directory.itemSubtitle', vars: {
                    'location': '${c.city}${c.district != null ? ' / ${c.district}' : ''}',
                    'years': c.experienceYears.toString(),
                  }),
                  style: const TextStyle(color: AppColors.silver500),
                ),
                trailing: Text(
                  tradeCategories.labelFor(c.primaryTradeCategory ?? ''),
                  style: const TextStyle(color: AppColors.gold400, fontSize: 12),
                ),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => CandidateDetailScreen(id: c.id)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}