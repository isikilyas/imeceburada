import 'package:flutter/material.dart';
import '../../core/api_client.dart';
import '../../core/constants.dart';
import '../../models/equipment_listing.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_dropdown.dart';
import '../../widgets/province_district_picker.dart';
import 'equipment_detail_screen.dart';
import 'new_equipment_screen.dart';

const _allEquipment = Option('', 'Tüm Ekipmanlar');

class EquipmentListScreen extends StatefulWidget {
  const EquipmentListScreen({super.key});

  @override
  State<EquipmentListScreen> createState() => _EquipmentListScreenState();
}

class _EquipmentListScreenState extends State<EquipmentListScreen> {
  final _api = ApiClient();
  String _equipmentType = '';
  String _city = '';
  String _district = '';

  bool _isLoading = true;
  String? _error;
  List<EquipmentListing> _listings = [];

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
      final raw = await _api.get('/equipment', query: {
        if (_equipmentType.isNotEmpty) 'equipmentType': _equipmentType,
        if (_city.isNotEmpty) 'city': _city,
        if (_district.isNotEmpty) 'district': _district,
      });
      final map = raw as Map<String, dynamic>;
      final items =
          (map['items'] as List).map((e) => EquipmentListing.fromJson(e as Map<String, dynamic>)).toList();
      setState(() => _listings = items);
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
      appBar: AppBar(
        title: const Text('Ekipman İlanları'),
        actions: [
          IconButton(
            tooltip: 'Yeni İlan',
            icon: const Icon(Icons.add_circle_outline),
            onPressed: () async {
              final created = await Navigator.of(context).push<bool>(
                MaterialPageRoute(builder: (_) => const NewEquipmentScreen()),
              );
              if (created == true) _load();
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          AppDropdown(
            label: 'Ekipman',
            value: _equipmentType,
            options: [_allEquipment, ...equipmentTypes],
            onChanged: (v) {
              setState(() => _equipmentType = v);
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
          if (!_isLoading && _error == null && _listings.isEmpty)
            const Padding(
              padding: EdgeInsets.all(12),
              child: Text('Sonuç bulunamadı.', style: TextStyle(color: AppColors.silver500)),
            ),
          ..._listings.map(
            (listing) => Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                title: Text(
                  '${equipmentTypes.labelFor(listing.equipmentType)}${listing.capacity != null ? ' · ${listing.capacity}' : ''}',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                subtitle: Text(
                  '${listing.ownerName} · ${listing.city}${listing.district != null ? ' / ${listing.district}' : ''}',
                  style: const TextStyle(color: AppColors.silver500),
                ),
                trailing: Text(
                  listing.dailyRate != null
                      ? '${listing.dailyRate} ₺/gün'
                      : listing.hourlyRate != null
                          ? '${listing.hourlyRate} ₺/saat'
                          : '',
                  style: const TextStyle(color: AppColors.gold400, fontSize: 12),
                ),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => EquipmentDetailScreen(id: listing.id)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}