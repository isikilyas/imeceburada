import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../models/subcontractor.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_dropdown.dart';
import '../../widgets/province_district_picker.dart';
import 'subcontractor_detail_screen.dart';

const _allTrades = Option('', 'Tüm Meslekler');

class SubcontractorDirectoryScreen extends StatefulWidget {
  const SubcontractorDirectoryScreen({super.key});

  @override
  State<SubcontractorDirectoryScreen> createState() => _SubcontractorDirectoryScreenState();
}

class _SubcontractorDirectoryScreenState extends State<SubcontractorDirectoryScreen> {
  String _tradeCategory = '';
  String _city = '';
  String _district = '';
  bool _isLoading = true;
  String? _error;
  List<SubcontractorDirectoryEntry> _subcontractors = [];

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
      final raw = await context.read<AuthStore>().authorizedGet('/subcontractors', query: {
        if (_tradeCategory.isNotEmpty) 'tradeCategory': _tradeCategory,
        if (_city.isNotEmpty) 'city': _city,
        if (_district.isNotEmpty) 'district': _district,
      });
      final map = raw as Map<String, dynamic>;
      final items = (map['items'] as List)
          .map((e) => SubcontractorDirectoryEntry.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() => _subcontractors = items);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Bağlantı hatası, tekrar deneyin');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Taşeron Firma Dizini')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Padding(
            padding: EdgeInsets.only(bottom: 12),
            child: Text(
              'Faturalı iş yapan taşeron firmaları meslek ve bölgeye göre bul.',
              style: TextStyle(color: AppColors.silver500, fontSize: 13),
            ),
          ),
          AppDropdown(
            label: 'Meslek',
            value: _tradeCategory,
            options: [_allTrades, ...tradeCategories],
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
          if (!_isLoading && _error == null && _subcontractors.isEmpty)
            const Padding(
              padding: EdgeInsets.all(12),
              child: Text('Sonuç bulunamadı.', style: TextStyle(color: AppColors.silver500)),
            ),
          ..._subcontractors.map(
            (s) => Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                title: Text(s.companyName, style: Theme.of(context).textTheme.titleMedium),
                subtitle: Text(
                  '${s.city}${s.district != null ? ' / ${s.district}' : ''}',
                  style: const TextStyle(color: AppColors.silver500),
                ),
                trailing: Text(
                  s.tradeCategories.isNotEmpty ? tradeCategories.labelFor(s.tradeCategories.first) : '',
                  style: const TextStyle(color: AppColors.gold400, fontSize: 12),
                ),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => SubcontractorDetailScreen(id: s.id)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}