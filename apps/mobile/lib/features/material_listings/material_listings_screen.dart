import 'package:flutter/material.dart';
import '../../core/api_client.dart';
import '../../core/constants.dart';
import '../../models/material_listing.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_dropdown.dart';
import '../../widgets/province_district_picker.dart';
import 'material_listing_detail_screen.dart';

const _allMaterials = Option('', 'Tüm Malzemeler');

class MaterialListingsScreen extends StatefulWidget {
  const MaterialListingsScreen({super.key});

  @override
  State<MaterialListingsScreen> createState() => _MaterialListingsScreenState();
}

class _MaterialListingsScreenState extends State<MaterialListingsScreen> {
  final _api = ApiClient();
  String _materialType = '';
  String _city = '';
  String _district = '';
  bool _isLoading = true;
  String? _error;
  List<MaterialListing> _listings = [];

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
      final raw = await _api.get('/material-listings', query: {
        if (_materialType.isNotEmpty) 'materialType': _materialType,
        if (_city.isNotEmpty) 'city': _city,
        if (_district.isNotEmpty) 'district': _district,
      });
      final map = raw as Map<String, dynamic>;
      final items = (map['items'] as List).map((e) => MaterialListing.fromJson(e as Map<String, dynamic>)).toList();
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
      appBar: AppBar(title: const Text('Malzeme İlanları')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          AppDropdown(
            label: 'Malzeme',
            value: _materialType,
            options: const [_allMaterials, ...materialTypes],
            onChanged: (v) {
              setState(() => _materialType = v);
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
                  materialTypes.labelFor(listing.materialType),
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                subtitle: Text(
                  '${listing.supplierName} · ${listing.city}${listing.district != null ? ' / ${listing.district}' : ''}',
                  style: const TextStyle(color: AppColors.silver500),
                ),
                trailing: Text(
                  '${listing.price} ₺/${listing.unit}',
                  style: const TextStyle(color: AppColors.gold400, fontWeight: FontWeight.w600),
                ),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => MaterialListingDetailScreen(id: listing.id)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}