import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../models/candidate_profile.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_dropdown.dart';
import '../../widgets/multi_checkbox_list.dart';
import '../../widgets/province_district_picker.dart';
import '../../widgets/trade_category_picker.dart';

class CandidateProfileScreen extends StatefulWidget {
  const CandidateProfileScreen({super.key});

  @override
  State<CandidateProfileScreen> createState() => _CandidateProfileScreenState();
}

class _CandidateProfileScreenState extends State<CandidateProfileScreen> {
  bool _isLoading = true;
  String? _loadError;

  String _tradeCategory = tradeFields.first.branches.first.professions.first.value;
  String _city = turkishProvinces.first;
  String _district = '';
  final _experienceYearsController = TextEditingController(text: '0');
  final _phoneController = TextEditingController();
  final _expectedSalaryController = TextEditingController();
  String _expectedSalaryPeriod = 'MONTHLY';
  List<String> _workPreferences = [];
  bool _isPublic = false;
  bool _phoneVisible = false;
  String _availabilityStatus = 'AVAILABLE';
  DateTime? _availableFrom;
  bool _notifyByEmail = true;
  bool _hasProfessionalQualificationCert = false;
  bool _hasMasterCraftsmanCert = false;
  bool _hasOshCert = false;
  final _serviceRadiusController = TextEditingController();

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
    _experienceYearsController.dispose();
    _phoneController.dispose();
    _expectedSalaryController.dispose();
    _serviceRadiusController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _loadError = null;
    });
    try {
      final raw = await context.read<AuthStore>().authorizedGet('/users/me/profile');
      final profile = CandidateProfile.fromJson(raw as Map<String, dynamic>);
      setState(() {
        _tradeCategory = profile.primaryTradeCategory ?? _tradeCategory;
        _city = profile.city;
        _district = profile.district ?? '';
        _experienceYearsController.text = profile.experienceYears.toString();
        _phoneController.text = profile.phone ?? '';
        _expectedSalaryController.text = profile.expectedSalaryMin?.toString() ?? '';
        _expectedSalaryPeriod = profile.expectedSalaryPeriod ?? 'MONTHLY';
        _workPreferences = profile.workPreferences;
        _isPublic = profile.isPublic;
        _phoneVisible = profile.phoneVisible;
        _availabilityStatus = profile.availabilityStatus;
        _availableFrom = profile.availableFrom != null ? DateTime.tryParse(profile.availableFrom!) : null;
        _notifyByEmail = profile.notifyByEmail;
        _hasProfessionalQualificationCert = profile.hasProfessionalQualificationCert;
        _hasMasterCraftsmanCert = profile.hasMasterCraftsmanCert;
        _hasOshCert = profile.hasOshCert;
        _serviceRadiusController.text = profile.serviceRadiusKm?.toString() ?? '';
      });
    } on ApiException catch (e) {
      setState(() => _loadError = e.message);
    } catch (_) {
      if (mounted) {
        setState(() => _loadError = context.read<LocaleStore>().t('profile.candidateProfile.loadFailed'));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _save() async {
    setState(() {
      _isSaving = true;
      _saveError = null;
      _saved = false;
    });
    try {
      await context.read<AuthStore>().authorizedPatch('/users/me/profile/candidate', body: {
        'primaryTradeCategory': _tradeCategory,
        'city': _city,
        if (_district.isNotEmpty) 'district': _district,
        'experienceYears': int.tryParse(_experienceYearsController.text.trim()) ?? 0,
        'phone': _phoneController.text.trim(),
        if (_expectedSalaryController.text.trim().isNotEmpty)
          'expectedSalaryMin': int.tryParse(_expectedSalaryController.text.trim()),
        'expectedSalaryPeriod': _expectedSalaryPeriod,
        'workPreferences': _workPreferences,
        'isPublic': _isPublic,
        'phoneVisible': _phoneVisible,
        'availabilityStatus': _availabilityStatus,
        if (_availabilityStatus == 'BUSY' && _availableFrom != null)
          'availableFrom': _availableFrom!.toIso8601String().substring(0, 10),
        'notifyByEmail': _notifyByEmail,
        'hasProfessionalQualificationCert': _hasProfessionalQualificationCert,
        'hasMasterCraftsmanCert': _hasMasterCraftsmanCert,
        'hasOshCert': _hasOshCert,
        if (_serviceRadiusController.text.trim().isNotEmpty)
          'serviceRadiusKm': int.tryParse(_serviceRadiusController.text.trim()),
      });
      setState(() => _saved = true);
    } on ApiException catch (e) {
      setState(() => _saveError = e.message);
    } catch (_) {
      if (mounted) {
        setState(() => _saveError = context.read<LocaleStore>().t('profile.candidateProfile.saveFailed'));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return Scaffold(
      appBar: AppBar(title: Text(t('profile.candidateProfile.title'))),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold500))
          : _loadError != null
              ? Center(child: Text(_loadError!, style: const TextStyle(color: AppColors.red400)))
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    TradeCategoryPicker(
                      value: _tradeCategory,
                      onChanged: (v) => setState(() => _tradeCategory = v),
                    ),
                    ProvinceDistrictPicker(
                      city: _city,
                      district: _district,
                      onCityChanged: (v) => setState(() => _city = v),
                      onDistrictChanged: (v) => setState(() => _district = v),
                      allowEmptyDistrict: true,
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
                    TextField(
                      controller: _experienceYearsController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(labelText: t('profile.candidateProfile.experienceYearsLabel')),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _phoneController,
                      decoration: InputDecoration(
                        labelText: t('profile.candidateProfile.phoneLabel'),
                        hintText: '+905551234567',
                      ),
                    ),
                    const SizedBox(height: 14),
                    AppDropdown(
                      label: t('profile.candidateProfile.expectedSalaryPeriodLabel'),
                      value: _expectedSalaryPeriod,
                      options: expectedRatePeriods,
                      onChanged: (v) => setState(() => _expectedSalaryPeriod = v),
                    ),
                    TextField(
                      controller: _expectedSalaryController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: t('profile.candidateProfile.expectedSalaryMinLabel'),
                        hintText: '30000',
                      ),
                    ),
                    const SizedBox(height: 14),
                    MultiCheckboxList(
                      label: t('profile.candidateProfile.workPreferencesLabel'),
                      options: workPreferences,
                      values: _workPreferences,
                      onChanged: (v) => setState(() => _workPreferences = v),
                    ),
                    const SizedBox(height: 14),
                    Text(t('profile.candidateProfile.availabilityLabel'),
                        style: const TextStyle(color: AppColors.silver300, fontSize: 14)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: _AvailabilityButton(
                            label: t('profile.candidateProfile.availableStatus'),
                            selected: _availabilityStatus == 'AVAILABLE',
                            selectedColor: const Color(0xFF16A34A),
                            onTap: () => setState(() => _availabilityStatus = 'AVAILABLE'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _AvailabilityButton(
                            label: t('profile.candidateProfile.busyStatus'),
                            selected: _availabilityStatus == 'BUSY',
                            selectedColor: AppColors.ink700,
                            onTap: () => setState(() => _availabilityStatus = 'BUSY'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      t('profile.candidateProfile.busyStatusHint'),
                      style: const TextStyle(color: AppColors.silver500, fontSize: 12),
                    ),
                    if (_availabilityStatus == 'BUSY') ...[
                      const SizedBox(height: 10),
                      OutlinedButton(
                        onPressed: () async {
                          final picked = await showDatePicker(
                            context: context,
                            initialDate: _availableFrom ?? DateTime.now(),
                            firstDate: DateTime.now(),
                            lastDate: DateTime.now().add(const Duration(days: 365)),
                          );
                          if (picked != null) setState(() => _availableFrom = picked);
                        },
                        child: Text(
                          _availableFrom != null
                              ? '${t('profile.candidateProfile.availableFromLabel')}: '
                                  '${_availableFrom!.day.toString().padLeft(2, '0')}.'
                                  '${_availableFrom!.month.toString().padLeft(2, '0')}.'
                                  '${_availableFrom!.year}'
                              : t('profile.candidateProfile.availableFromLabel'),
                        ),
                      ),
                    ],
                    const SizedBox(height: 14),
                    Text(t('profile.candidateProfile.certsHeading'),
                        style: const TextStyle(color: AppColors.silver300, fontSize: 14)),
                    CheckboxListTile(
                      value: _hasProfessionalQualificationCert,
                      onChanged: (v) => setState(() => _hasProfessionalQualificationCert = v ?? false),
                      title: Text(
                        t('profile.candidateProfile.certProfessionalQualification'),
                        style: const TextStyle(color: AppColors.silver300, fontSize: 14),
                      ),
                      controlAffinity: ListTileControlAffinity.leading,
                      contentPadding: EdgeInsets.zero,
                      activeColor: AppColors.gold500,
                    ),
                    CheckboxListTile(
                      value: _hasMasterCraftsmanCert,
                      onChanged: (v) => setState(() => _hasMasterCraftsmanCert = v ?? false),
                      title: Text(
                        t('profile.candidateProfile.certMasterCraftsman'),
                        style: const TextStyle(color: AppColors.silver300, fontSize: 14),
                      ),
                      controlAffinity: ListTileControlAffinity.leading,
                      contentPadding: EdgeInsets.zero,
                      activeColor: AppColors.gold500,
                    ),
                    CheckboxListTile(
                      value: _hasOshCert,
                      onChanged: (v) => setState(() => _hasOshCert = v ?? false),
                      title: Text(
                        t('profile.candidateProfile.certOsh'),
                        style: const TextStyle(color: AppColors.silver300, fontSize: 14),
                      ),
                      controlAffinity: ListTileControlAffinity.leading,
                      contentPadding: EdgeInsets.zero,
                      activeColor: AppColors.gold500,
                    ),
                    Text(
                      t('profile.candidateProfile.certsHint'),
                      style: const TextStyle(color: AppColors.silver500, fontSize: 12),
                    ),
                    const SizedBox(height: 14),
                    CheckboxListTile(
                      value: _isPublic,
                      onChanged: (v) => setState(() => _isPublic = v ?? false),
                      title: Text(
                        t('profile.candidateProfile.publicListingLabel'),
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
                        t('profile.candidateProfile.phoneVisibleLabel'),
                        style: const TextStyle(color: AppColors.silver300, fontSize: 14),
                      ),
                      subtitle: Text(
                        t('profile.candidateProfile.phoneVisibleHint'),
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
                        t('profile.candidateProfile.notifyByEmailLabel'),
                        style: const TextStyle(color: AppColors.silver300, fontSize: 14),
                      ),
                      subtitle: Text(
                        t('profile.candidateProfile.notifyByEmailHint'),
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
                      Text(t('profile.candidateProfile.saved'), style: const TextStyle(color: AppColors.green400)),
                    ],
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: _isSaving ? null : _save,
                      child: Text(_isSaving
                          ? t('profile.candidateProfile.saving')
                          : t('profile.candidateProfile.saveButton')),
                    ),
                  ],
                ),
    );
  }
}

class _AvailabilityButton extends StatelessWidget {
  final String label;
  final bool selected;
  final Color selectedColor;
  final VoidCallback onTap;

  const _AvailabilityButton({
    required this.label,
    required this.selected,
    required this.selectedColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? selectedColor : AppColors.ink900,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: selected ? selectedColor : AppColors.ink700),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: selected ? Colors.white : AppColors.silver400,
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
        ),
      ),
    );
  }
}