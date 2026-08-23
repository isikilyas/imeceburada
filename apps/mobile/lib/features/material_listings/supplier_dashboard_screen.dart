import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../models/material_listing.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_dropdown.dart';
import '../../widgets/province_district_picker.dart';
import '../membership/membership_screen.dart';

class SupplierDashboardScreen extends StatefulWidget {
  const SupplierDashboardScreen({super.key});

  @override
  State<SupplierDashboardScreen> createState() => _SupplierDashboardScreenState();
}

class _SupplierDashboardScreenState extends State<SupplierDashboardScreen> {
  bool _isLoading = true;
  List<MaterialListing> _listings = [];

  String _materialType = materialTypes.first.value;
  String _city = turkishProvinces.first;
  String _district = '';
  final _priceController = TextEditingController();
  final _descriptionController = TextEditingController();
  bool _isSubmitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    try {
      final raw = await context.read<AuthStore>().authorizedGet('/material-listings/mine');
      final items = (raw as List).map((e) => MaterialListing.fromJson(e as Map<String, dynamic>)).toList();
      setState(() => _listings = items);
    } catch (_) {
      // sessizce geç — liste boş kalır
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _create() async {
    setState(() {
      _isSubmitting = true;
      _error = null;
    });
    try {
      await context.read<AuthStore>().authorizedPost('/material-listings', body: {
        'materialType': _materialType,
        'city': _city,
        if (_district.isNotEmpty) 'district': _district,
        'price': int.tryParse(_priceController.text) ?? 0,
        'description': _descriptionController.text.trim(),
      });
      _priceController.clear();
      _descriptionController.clear();
      await _load();
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = context.read<LocaleStore>().t('materialListings.dashboard.submitError'));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return Scaffold(
      appBar: AppBar(
        title: Text(t('materialListings.dashboard.title')),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const MembershipScreen()),
            ),
            child: Text(t('materialListings.dashboard.membership'), style: const TextStyle(color: AppColors.gold400)),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(t('materialListings.dashboard.myListings'), style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 18)),
          const SizedBox(height: 12),
          if (_isLoading) const Center(child: CircularProgressIndicator(color: AppColors.gold500)),
          if (!_isLoading && _listings.isEmpty)
            Text(t('materialListings.dashboard.empty'), style: const TextStyle(color: AppColors.silver500)),
          ..._listings.map(
            (listing) => Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                title: Text(materialTypes.labelFor(listing.materialType)),
                subtitle: Text(
                  '${listing.city}${listing.district != null ? ' / ${listing.district}' : ''} · ${listing.price} ₺/${listing.unit} · '
                  '${listing.status == "AVAILABLE" ? t('materialListings.dashboard.active') : t('materialListings.dashboard.inactive')}',
                  style: const TextStyle(color: AppColors.silver500),
                ),
              ),
            ),
          ),
          const Divider(height: 32, color: AppColors.ink800),
          Text(t('materialListings.dashboard.newListingTitle'), style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 18)),
          const SizedBox(height: 12),
          AppDropdown(
            label: t('materialListings.dashboard.materialLabel'),
            value: _materialType,
            options: materialTypes,
            onChanged: (v) => setState(() => _materialType = v),
          ),
          ProvinceDistrictPicker(
            city: _city,
            district: _district,
            allowEmptyDistrict: true,
            onCityChanged: (v) => setState(() {
              _city = v;
              _district = '';
            }),
            onDistrictChanged: (v) => setState(() => _district = v),
          ),
          TextField(
            controller: _priceController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(labelText: t('materialListings.dashboard.priceLabel')),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _descriptionController,
            maxLines: 3,
            decoration: InputDecoration(labelText: t('materialListings.dashboard.descriptionLabel')),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: AppColors.red400)),
          ],
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _create,
            child: Text(_isSubmitting ? t('materialListings.dashboard.creating') : t('materialListings.dashboard.publish')),
          ),
        ],
      ),
    );
  }
}
