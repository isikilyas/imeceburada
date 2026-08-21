import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../theme/app_theme.dart';
import '../../widgets/equipment_category_picker.dart';
import '../../widgets/province_district_picker.dart';

class NewEquipmentScreen extends StatefulWidget {
  const NewEquipmentScreen({super.key});

  @override
  State<NewEquipmentScreen> createState() => _NewEquipmentScreenState();
}

class _NewEquipmentScreenState extends State<NewEquipmentScreen> {
  String _equipmentType = equipmentCategories.first.items.first.value;
  String _city = turkishProvinces.first;
  String _district = '';
  final _capacityController = TextEditingController();
  final _dailyRateController = TextEditingController();
  final _hourlyRateController = TextEditingController();
  final _descriptionController = TextEditingController();

  bool _isSubmitting = false;
  String? _error;

  @override
  void dispose() {
    _capacityController.dispose();
    _dailyRateController.dispose();
    _hourlyRateController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _isSubmitting = true;
      _error = null;
    });
    try {
      await context.read<AuthStore>().authorizedPost('/equipment', body: {
        'equipmentType': _equipmentType,
        if (_capacityController.text.trim().isNotEmpty) 'capacity': _capacityController.text.trim(),
        'city': _city,
        if (_district.isNotEmpty) 'district': _district,
        if (_dailyRateController.text.trim().isNotEmpty)
          'dailyRate': int.tryParse(_dailyRateController.text.trim()),
        if (_hourlyRateController.text.trim().isNotEmpty)
          'hourlyRate': int.tryParse(_hourlyRateController.text.trim()),
        'description': _descriptionController.text.trim(),
      });
      if (mounted) Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'İlan oluşturulamadı');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Yeni Ekipman İlanı')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          EquipmentCategoryPicker(
            value: _equipmentType,
            onChanged: (v) => setState(() {
              _equipmentType = v;
              _capacityController.clear();
            }),
          ),
          TextField(
            controller: _capacityController,
            decoration: const InputDecoration(labelText: 'Kapasite (opsiyonel, örn. 20 Ton)'),
          ),
          const SizedBox(height: 12),
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
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _dailyRateController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Günlük Ücret (₺)'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _hourlyRateController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Saatlik Ücret (₺)'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _descriptionController,
            maxLines: 4,
            decoration: const InputDecoration(labelText: 'Açıklama'),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: AppColors.red400)),
          ],
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submit,
            child: Text(_isSubmitting ? 'Yayınlanıyor...' : 'İlanı Yayınla'),
          ),
        ],
      ),
    );
  }
}