import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../models/company.dart';
import '../../theme/app_theme.dart';
import '../../widgets/company_name_warning.dart';
import '../../widgets/province_district_picker.dart';
import '../membership/membership_screen.dart';

class CompanyProfileScreen extends StatefulWidget {
  const CompanyProfileScreen({super.key});

  @override
  State<CompanyProfileScreen> createState() => _CompanyProfileScreenState();
}

class _CompanyProfileScreenState extends State<CompanyProfileScreen> {
  bool _isLoading = true;
  String? _loadError;

  final _companyNameController = TextEditingController();
  final _sectorController = TextEditingController();
  final _maxSalaryOfferController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _authorizedPersonController = TextEditingController();
  final _taxOfficeController = TextEditingController();
  final _taxNumberController = TextEditingController();
  final _mersisController = TextEditingController();
  final _websiteController = TextEditingController();
  final _companyEmailController = TextEditingController();
  String _city = turkishProvinces.first;
  String _district = '';
  bool _phoneVisible = false;
  bool _notifyByEmail = true;
  bool _hasActivityCertificate = false;

  bool _isSaving = false;
  String? _saveError;
  bool _saved = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _companyNameController.dispose();
    _sectorController.dispose();
    _maxSalaryOfferController.dispose();
    _descriptionController.dispose();
    _authorizedPersonController.dispose();
    _taxOfficeController.dispose();
    _taxNumberController.dispose();
    _mersisController.dispose();
    _websiteController.dispose();
    _companyEmailController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _loadError = null;
    });
    try {
      final raw = await context.read<AuthStore>().authorizedGet('/users/me/profile');
      final profile = CompanyProfile.fromJson(raw as Map<String, dynamic>);
      setState(() {
        _companyNameController.text = profile.companyName;
        _sectorController.text = profile.sector ?? '';
        _maxSalaryOfferController.text = profile.maxSalaryOffer?.toString() ?? '';
        _city = profile.city;
        _district = profile.district ?? '';
        _descriptionController.text = profile.description ?? '';
        _authorizedPersonController.text = profile.authorizedPersonName ?? '';
        _taxOfficeController.text = profile.taxOffice ?? '';
        _taxNumberController.text = profile.taxNumber ?? '';
        _mersisController.text = profile.mersisNumber ?? '';
        _websiteController.text = profile.website ?? '';
        _companyEmailController.text = profile.companyEmail ?? '';
        _phoneVisible = profile.phoneVisible;
        _notifyByEmail = profile.notifyByEmail;
        _hasActivityCertificate = profile.hasActivityCertificate;
      });
    } on ApiException catch (e) {
      setState(() => _loadError = e.message);
    } catch (_) {
      setState(() => _loadError = context.read<LocaleStore>().t('company.dashboard.loadError'));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _save() async {
    final t = context.read<LocaleStore>().t;
    if (_companyNameController.text.trim().isEmpty) {
      setState(() => _saveError = t('company.dashboard.nameRequiredError'));
      return;
    }
    setState(() {
      _isSaving = true;
      _saveError = null;
      _saved = false;
    });
    try {
      await context.read<AuthStore>().authorizedPatch('/users/me/profile/company', body: {
        'companyName': _companyNameController.text.trim(),
        'sector': _sectorController.text.trim(),
        if (_maxSalaryOfferController.text.trim().isNotEmpty)
          'maxSalaryOffer': int.tryParse(_maxSalaryOfferController.text.trim()),
        'city': _city,
        if (_district.isNotEmpty) 'district': _district,
        'description': _descriptionController.text.trim(),
        if (_authorizedPersonController.text.trim().isNotEmpty)
          'authorizedPersonName': _authorizedPersonController.text.trim(),
        if (_taxOfficeController.text.trim().isNotEmpty) 'taxOffice': _taxOfficeController.text.trim(),
        if (_taxNumberController.text.trim().isNotEmpty) 'taxNumber': _taxNumberController.text.trim(),
        if (_mersisController.text.trim().isNotEmpty) 'mersisNumber': _mersisController.text.trim(),
        if (_websiteController.text.trim().isNotEmpty) 'website': _websiteController.text.trim(),
        if (_companyEmailController.text.trim().isNotEmpty) 'companyEmail': _companyEmailController.text.trim(),
        'phoneVisible': _phoneVisible,
        'notifyByEmail': _notifyByEmail,
        'hasActivityCertificate': _hasActivityCertificate,
      });
      setState(() => _saved = true);
    } on ApiException catch (e) {
      setState(() => _saveError = e.message);
    } catch (_) {
      setState(() => _saveError = t('company.dashboard.saveError'));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return Scaffold(
      appBar: AppBar(
        title: Text(t('company.dashboard.title')),
        actions: [
          TextButton(
            onPressed: () =>
                Navigator.of(context).push(MaterialPageRoute(builder: (_) => const MembershipScreen())),
            child: Text(t('company.dashboard.membership')),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold500))
          : _loadError != null
              ? Center(child: Text(_loadError!, style: const TextStyle(color: AppColors.red400)))
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(
                        t('company.dashboard.hint'),
                        style: const TextStyle(color: AppColors.silver500, fontSize: 12),
                      ),
                    ),
                    TextField(
                      controller: _companyNameController,
                      onChanged: (_) => setState(() {}),
                      decoration: InputDecoration(labelText: t('company.dashboard.companyNameLabel')),
                    ),
                    CompanyNameWarning(name: _companyNameController.text),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _sectorController,
                      decoration: InputDecoration(labelText: t('company.dashboard.sectorLabel')),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _maxSalaryOfferController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(labelText: t('company.dashboard.maxSalaryOfferLabel')),
                    ),
                    const SizedBox(height: 12),
                    ProvinceDistrictPicker(
                      city: _city,
                      district: _district,
                      onCityChanged: (v) => setState(() => _city = v),
                      onDistrictChanged: (v) => setState(() => _district = v),
                      allowEmptyDistrict: true,
                    ),
                    TextField(
                      controller: _descriptionController,
                      maxLines: 3,
                      decoration: InputDecoration(labelText: t('company.dashboard.descriptionLabel')),
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
                    CheckboxListTile(
                      value: _notifyByEmail,
                      onChanged: (v) => setState(() => _notifyByEmail = v ?? true),
                      title: Text(
                        t('company.dashboard.notifyByEmailLabel'),
                        style: const TextStyle(color: AppColors.silver300, fontSize: 14),
                      ),
                      subtitle: Text(
                        t('company.dashboard.notifyByEmailHint'),
                        style: const TextStyle(color: AppColors.silver500, fontSize: 12),
                      ),
                      controlAffinity: ListTileControlAffinity.leading,
                      contentPadding: EdgeInsets.zero,
                      activeColor: AppColors.gold500,
                    ),
                    if (_saveError != null) ...[
                      const SizedBox(height: 8),
                      Text(_saveError!, style: const TextStyle(color: AppColors.red400)),
                    ],
                    if (_saved) ...[
                      const SizedBox(height: 8),
                      Text(t('company.dashboard.saved'), style: const TextStyle(color: AppColors.green400)),
                    ],
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: _isSaving ? null : _save,
                      child: Text(_isSaving ? t('company.dashboard.saving') : t('company.dashboard.save')),
                    ),
                  ],
                ),
    );
  }
}
