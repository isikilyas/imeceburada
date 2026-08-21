import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../models/subcontractor.dart';
import '../../theme/app_theme.dart';
import '../../widgets/province_district_picker.dart';
import '../../widgets/trade_category_picker.dart';
import '../membership/membership_screen.dart';

class SubcontractorDashboardScreen extends StatefulWidget {
  const SubcontractorDashboardScreen({super.key});

  @override
  State<SubcontractorDashboardScreen> createState() => _SubcontractorDashboardScreenState();
}

class _SubcontractorDashboardScreenState extends State<SubcontractorDashboardScreen> {
  bool _isLoading = true;
  String? _loadError;

  final _companyNameController = TextEditingController();
  final _descriptionController = TextEditingController();
  String _city = turkishProvinces.first;
  String _district = '';
  List<String> _tradeCategories = [tradeFields.first.branches.first.professions.first.value];
  bool _isPublic = true;

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
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _loadError = null;
    });
    try {
      final raw = await context.read<AuthStore>().authorizedGet('/users/me/profile');
      final profile = SubcontractorProfile.fromJson(raw as Map<String, dynamic>);
      setState(() {
        _companyNameController.text = profile.companyName;
        _city = profile.city;
        _district = profile.district ?? '';
        _tradeCategories = profile.tradeCategories.isNotEmpty ? profile.tradeCategories : _tradeCategories;
        _descriptionController.text = profile.description ?? '';
        _isPublic = profile.isPublic;
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
    if (_tradeCategories.isEmpty) {
      setState(() => _saveError = 'En az bir branş/meslek seçmelisin');
      return;
    }
    setState(() {
      _isSaving = true;
      _saveError = null;
      _saved = false;
    });
    try {
      await context.read<AuthStore>().authorizedPatch('/users/me/profile/subcontractor', body: {
        'companyName': _companyNameController.text.trim(),
        'city': _city,
        if (_district.isNotEmpty) 'district': _district,
        'tradeCategories': _tradeCategories,
        'description': _descriptionController.text.trim(),
        'isPublic': _isPublic,
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
      appBar: AppBar(
        title: const Text('Taşeron Firma Profilim'),
        actions: [
          TextButton(
            onPressed: () =>
                Navigator.of(context).push(MaterialPageRoute(builder: (_) => const MembershipScreen())),
            child: const Text('Üyelik'),
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
                    const Padding(
                      padding: EdgeInsets.only(bottom: 12),
                      child: Text(
                        'Dizinde görünmek ve firmaların size ulaşabilmesi için aktif üyeliğin ve '
                        'doğrulanmış telefon numaran olmalı.',
                        style: TextStyle(color: AppColors.silver500, fontSize: 12),
                      ),
                    ),
                    TextField(
                      controller: _companyNameController,
                      decoration: const InputDecoration(labelText: 'Firma Adı'),
                    ),
                    const SizedBox(height: 12),
                    TradeCategoryMultiPicker(
                      values: _tradeCategories,
                      onChanged: (v) => setState(() => _tradeCategories = v),
                    ),
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
                      decoration: const InputDecoration(labelText: 'Açıklama'),
                    ),
                    const SizedBox(height: 14),
                    CheckboxListTile(
                      value: _isPublic,
                      onChanged: (v) => setState(() => _isPublic = v ?? true),
                      title: const Text(
                        'Profilimi firmaların arayabileceği taşeron firma dizininde göster',
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