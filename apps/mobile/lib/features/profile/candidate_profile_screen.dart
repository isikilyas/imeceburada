import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../models/candidate_profile.dart';
import '../../theme/app_theme.dart';
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
  List<String> _workPreferences = [];
  bool _isPublic = false;
  String _availabilityStatus = 'AVAILABLE';

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
        _workPreferences = profile.workPreferences;
        _isPublic = profile.isPublic;
        _availabilityStatus = profile.availabilityStatus;
      });
    } on ApiException catch (e) {
      setState(() => _loadError = e.message);
    } catch (_) {
      setState(() => _loadError = 'Profil yüklenemedi');
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
        'workPreferences': _workPreferences,
        'isPublic': _isPublic,
        'availabilityStatus': _availabilityStatus,
      });
      setState(() => _saved = true);
    } on ApiException catch (e) {
      setState(() => _saveError = e.message);
    } catch (_) {
      setState(() => _saveError = 'Kaydedilemedi');
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profilim')),
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
                      controller: _experienceYearsController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Deneyim (yıl)'),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _phoneController,
                      decoration: const InputDecoration(labelText: 'Telefon', hintText: '+905551234567'),
                    ),
                    const SizedBox(height: 14),
                    MultiCheckboxList(
                      label: 'Çalışma Şekli Tercihlerim',
                      options: workPreferences,
                      values: _workPreferences,
                      onChanged: (v) => setState(() => _workPreferences = v),
                    ),
                    const SizedBox(height: 14),
                    const Text('Müsaitlik Durumu', style: TextStyle(color: AppColors.silver300, fontSize: 14)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: _AvailabilityButton(
                            label: '🟢 Müsaitim',
                            selected: _availabilityStatus == 'AVAILABLE',
                            selectedColor: const Color(0xFF16A34A),
                            onTap: () => setState(() => _availabilityStatus = 'AVAILABLE'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _AvailabilityButton(
                            label: '🔴 Şu An Çalışıyorum',
                            selected: _availabilityStatus == 'BUSY',
                            selectedColor: AppColors.ink700,
                            onTap: () => setState(() => _availabilityStatus = 'BUSY'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      '"Şu an çalışıyorum" seçersen dizindeki WhatsApp ile iletişim butonun geçici olarak kapanır.',
                      style: TextStyle(color: AppColors.silver500, fontSize: 12),
                    ),
                    const SizedBox(height: 14),
                    CheckboxListTile(
                      value: _isPublic,
                      onChanged: (v) => setState(() => _isPublic = v ?? false),
                      title: const Text(
                        'Profilimi firmaların arayabileceği usta dizininde göster',
                        style: TextStyle(color: AppColors.silver300, fontSize: 14),
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
                      const Text('Kaydedildi!', style: TextStyle(color: AppColors.green400)),
                    ],
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: _isSaving ? null : _save,
                      child: Text(_isSaving ? 'Kaydediliyor...' : 'Kaydet'),
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