import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../models/material_listing.dart';
import '../../models/supplier_profile.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_dropdown.dart';
import '../../widgets/company_name_warning.dart';
import '../../widgets/custom_term_field.dart';
import '../../widgets/material_category_picker.dart';
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
  bool _showCustomMaterialType = false;
  String _city = turkishProvinces.first;
  String _district = '';
  final _priceController = TextEditingController();
  final _descriptionController = TextEditingController();
  bool _isSubmitting = false;
  String? _error;

  bool _isProfileLoading = true;
  final _companyNameController = TextEditingController();
  final _serviceRadiusController = TextEditingController();
  final _profileDescriptionController = TextEditingController();
  final _authorizedPersonController = TextEditingController();
  final _taxOfficeController = TextEditingController();
  final _taxNumberController = TextEditingController();
  final _mersisController = TextEditingController();
  final _websiteController = TextEditingController();
  final _companyEmailController = TextEditingController();
  String _profileCity = turkishProvinces.first;
  String _profileDistrict = '';
  List<String> _supplyCategories = [];
  bool _phoneVisible = false;
  bool _hasActivityCertificate = false;
  bool _isProfileSaving = false;
  String? _profileError;
  bool _profileSaved = false;

  @override
  void initState() {
    super.initState();
    _load();
    _loadProfile();
  }

  @override
  void dispose() {
    _priceController.dispose();
    _descriptionController.dispose();
    _companyNameController.dispose();
    _serviceRadiusController.dispose();
    _profileDescriptionController.dispose();
    _authorizedPersonController.dispose();
    _taxOfficeController.dispose();
    _taxNumberController.dispose();
    _mersisController.dispose();
    _websiteController.dispose();
    _companyEmailController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() => _isProfileLoading = true);
    try {
      final raw = await context.read<AuthStore>().authorizedGet('/users/me/profile');
      final profile = SupplierProfile.fromJson(raw as Map<String, dynamic>);
      setState(() {
        _companyNameController.text = profile.companyName;
        _profileCity = profile.city;
        _profileDistrict = profile.district ?? '';
        _serviceRadiusController.text = profile.serviceRadiusKm?.toString() ?? '';
        _profileDescriptionController.text = profile.description ?? '';
        _authorizedPersonController.text = profile.authorizedPersonName ?? '';
        _taxOfficeController.text = profile.taxOffice ?? '';
        _taxNumberController.text = profile.taxNumber ?? '';
        _mersisController.text = profile.mersisNumber ?? '';
        _websiteController.text = profile.website ?? '';
        _companyEmailController.text = profile.companyEmail ?? '';
        _supplyCategories = profile.supplyCategories;
        _phoneVisible = profile.phoneVisible;
        _hasActivityCertificate = profile.hasActivityCertificate;
      });
    } catch (_) {
      // sessizce geç
    } finally {
      if (mounted) setState(() => _isProfileLoading = false);
    }
  }

  Future<void> _saveProfile() async {
    setState(() {
      _isProfileSaving = true;
      _profileError = null;
      _profileSaved = false;
    });
    try {
      await context.read<AuthStore>().authorizedPatch('/users/me/profile/supplier', body: {
        'companyName': _companyNameController.text.trim(),
        'city': _profileCity,
        if (_profileDistrict.isNotEmpty) 'district': _profileDistrict,
        if (_serviceRadiusController.text.trim().isNotEmpty)
          'serviceRadiusKm': int.tryParse(_serviceRadiusController.text.trim()),
        'description': _profileDescriptionController.text.trim(),
        if (_authorizedPersonController.text.trim().isNotEmpty)
          'authorizedPersonName': _authorizedPersonController.text.trim(),
        if (_taxOfficeController.text.trim().isNotEmpty) 'taxOffice': _taxOfficeController.text.trim(),
        if (_taxNumberController.text.trim().isNotEmpty) 'taxNumber': _taxNumberController.text.trim(),
        if (_mersisController.text.trim().isNotEmpty) 'mersisNumber': _mersisController.text.trim(),
        if (_websiteController.text.trim().isNotEmpty) 'website': _websiteController.text.trim(),
        if (_companyEmailController.text.trim().isNotEmpty) 'companyEmail': _companyEmailController.text.trim(),
        'supplyCategories': _supplyCategories,
        'phoneVisible': _phoneVisible,
        'hasActivityCertificate': _hasActivityCertificate,
      });
      setState(() => _profileSaved = true);
    } on ApiException catch (e) {
      setState(() => _profileError = e.message);
    } catch (_) {
      setState(() => _profileError = context.read<LocaleStore>().t('materialListings.dashboard.submitError'));
    } finally {
      if (mounted) setState(() => _isProfileSaving = false);
    }
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

  Future<void> _deactivate(String id) async {
    final t = context.read<LocaleStore>().t;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        content: Text(t('materialListings.dashboard.deactivateConfirm')),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: Text(t('profile.deleteAccountCancelButton')),
          ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: Text(t('materialListings.dashboard.deactivateButton')),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    try {
      await context.read<AuthStore>().authorizedDelete('/material-listings/$id');
      await _load();
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
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
          Text(t('materialListings.dashboard.profileHeading'),
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 18)),
          const SizedBox(height: 12),
          if (_isProfileLoading)
            const Center(child: CircularProgressIndicator(color: AppColors.gold500))
          else ...[
            TextField(
              controller: _companyNameController,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(labelText: t('company.dashboard.companyNameLabel')),
            ),
            CompanyNameWarning(name: _companyNameController.text),
            const SizedBox(height: 12),
            ProvinceDistrictPicker(
              city: _profileCity,
              district: _profileDistrict,
              allowEmptyDistrict: true,
              onCityChanged: (v) => setState(() {
                _profileCity = v;
                _profileDistrict = '';
              }),
              onDistrictChanged: (v) => setState(() => _profileDistrict = v),
            ),
            TextField(
              controller: _serviceRadiusController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: t('profile.candidateProfile.serviceRadiusLabel'),
                hintText: '50',
              ),
            ),
            const SizedBox(height: 4),
            Text(
              t('profile.candidateProfile.serviceRadiusHint'),
              style: const TextStyle(color: AppColors.silver500, fontSize: 12),
            ),
            const SizedBox(height: 12),
            MaterialCategoryMultiPicker(
              values: _supplyCategories,
              onChanged: (v) => setState(() => _supplyCategories = v),
            ),
            TextField(
              controller: _profileDescriptionController,
              maxLines: 3,
              decoration: InputDecoration(labelText: t('materialListings.dashboard.descriptionLabel')),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _authorizedPersonController,
              decoration: InputDecoration(labelText: t('company.dashboard.authorizedPersonLabel')),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _taxOfficeController,
              decoration: InputDecoration(labelText: t('company.dashboard.taxOfficeLabel')),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _taxNumberController,
              decoration: InputDecoration(labelText: t('company.dashboard.taxNumberLabel')),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _mersisController,
              decoration: InputDecoration(labelText: t('company.dashboard.mersisLabel')),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _websiteController,
              decoration: InputDecoration(labelText: t('company.dashboard.websiteLabel')),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _companyEmailController,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(labelText: t('company.dashboard.companyEmailLabel')),
            ),
            const SizedBox(height: 14),
            CheckboxListTile(
              value: _hasActivityCertificate,
              onChanged: (v) => setState(() => _hasActivityCertificate = v ?? false),
              title: Text(
                t('company.dashboard.activityCertificateLabel'),
                style: const TextStyle(color: AppColors.silver300, fontSize: 14),
              ),
              controlAffinity: ListTileControlAffinity.leading,
              contentPadding: EdgeInsets.zero,
              activeColor: AppColors.gold500,
            ),
            CheckboxListTile(
              value: _phoneVisible,
              onChanged: (v) => setState(() => _phoneVisible = v ?? false),
              title: Text(
                t('company.dashboard.phoneVisibleLabel'),
                style: const TextStyle(color: AppColors.silver300, fontSize: 14),
              ),
              subtitle: Text(
                t('company.dashboard.phoneVisibleHint'),
                style: const TextStyle(color: AppColors.silver500, fontSize: 12),
              ),
              controlAffinity: ListTileControlAffinity.leading,
              contentPadding: EdgeInsets.zero,
              activeColor: AppColors.gold500,
            ),
            if (_profileError != null) ...[
              const SizedBox(height: 8),
              Text(_profileError!, style: const TextStyle(color: AppColors.red400)),
            ],
            if (_profileSaved) ...[
              const SizedBox(height: 8),
              Text(t('company.dashboard.saved'), style: const TextStyle(color: AppColors.green400)),
            ],
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isProfileSaving ? null : _saveProfile,
              child: Text(_isProfileSaving ? t('company.dashboard.saving') : t('company.dashboard.save')),
            ),
          ],
          const Divider(height: 32, color: AppColors.ink800),
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
                trailing: listing.status == 'AVAILABLE'
                    ? TextButton(
                        onPressed: () => _deactivate(listing.id),
                        child: Text(t('materialListings.dashboard.deactivateButton')),
                      )
                    : null,
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
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton(
              onPressed: () => setState(() => _showCustomMaterialType = !_showCustomMaterialType),
              child: Text(
                _showCustomMaterialType ? 'Listeden seç' : 'Listede yok mu? Kendi terimini yaz',
                style: const TextStyle(color: AppColors.silver500, fontSize: 12),
              ),
            ),
          ),
          if (_showCustomMaterialType)
            CustomTermField(
              taxonomyType: 'MATERIAL_TYPE',
              onAdd: (v) => setState(() {
                _materialType = v;
                _showCustomMaterialType = false;
              }),
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
