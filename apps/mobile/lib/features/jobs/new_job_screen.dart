import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_dropdown.dart';
import '../../widgets/province_district_picker.dart';
import '../../widgets/trade_category_picker.dart';

class NewJobScreen extends StatefulWidget {
  const NewJobScreen({super.key});

  @override
  State<NewJobScreen> createState() => _NewJobScreenState();
}

class _NewJobScreenState extends State<NewJobScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _salaryMinController = TextEditingController();
  final _salaryMaxController = TextEditingController();

  String _listingType = listingIntents.first.value;
  String _tradeCategory = tradeFields.first.branches.first.professions.first.value;
  String _city = turkishProvinces.first;
  String _district = '';
  String _employmentType = employmentTypes.first.value;

  bool _isSubmitting = false;
  String? _error;

  Future<void> _submit() async {
    setState(() {
      _isSubmitting = true;
      _error = null;
    });
    try {
      await context.read<AuthStore>().authorizedPost('/jobs', body: {
        'title': _titleController.text.trim(),
        'listingType': _listingType,
        'tradeCategory': _tradeCategory,
        'city': _city,
        if (_district.isNotEmpty) 'district': _district,
        'employmentType': _employmentType,
        if (_salaryMinController.text.trim().isNotEmpty) 'salaryMin': int.tryParse(_salaryMinController.text.trim()),
        if (_salaryMaxController.text.trim().isNotEmpty) 'salaryMax': int.tryParse(_salaryMaxController.text.trim()),
        'description': _descriptionController.text.trim(),
      });
      if (mounted) Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = context.read<LocaleStore>().t('jobs.new.createFailed'));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return Scaffold(
      appBar: AppBar(title: Text(t('jobs.new.title'))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _titleController,
            decoration: InputDecoration(labelText: t('jobs.new.titleLabel')),
          ),
          const SizedBox(height: 12),
          AppDropdown(
            label: t('jobs.new.listingTypeLabel'),
            value: _listingType,
            options: listingIntents,
            onChanged: (v) => setState(() => _listingType = v),
          ),
          TradeCategoryPicker(
            value: _tradeCategory,
            onChanged: (v) => setState(() => _tradeCategory = v),
          ),
          ProvinceDistrictPicker(
            city: _city,
            district: _district,
            onCityChanged: (v) => setState(() => _city = v),
            onDistrictChanged: (v) => setState(() => _district = v),
          ),
          AppDropdown(
            label: t('jobs.new.employmentTypeLabel'),
            value: _employmentType,
            options: employmentTypes,
            onChanged: (v) => setState(() => _employmentType = v),
          ),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _salaryMinController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(labelText: t('jobs.new.minSalaryLabel')),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _salaryMaxController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(labelText: t('jobs.new.maxSalaryLabel')),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _descriptionController,
            maxLines: 4,
            decoration: InputDecoration(labelText: t('jobs.new.descriptionLabel')),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: AppColors.red400)),
          ],
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submit,
            child: Text(_isSubmitting ? t('jobs.new.publishing') : t('jobs.new.publish')),
          ),
        ],
      ),
    );
  }
}