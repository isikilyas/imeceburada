import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_dropdown.dart';
import '../../widgets/province_district_picker.dart';
import '../../widgets/trade_category_picker.dart';

/// "Yevmiye/Maaş Bilgisi Paylaş" (isLabor: true) veya "Malzeme Fiyatı Paylaş"
/// (isLabor: false) — web'deki wage-index/material-index sayfalarındaki
/// gönderim formunun mobil karşılığı, submissionType (Gerçekleşen/Teklif)
/// ayrımı dahil.
class SubmitPriceScreen extends StatefulWidget {
  final bool isLabor;
  const SubmitPriceScreen({super.key, required this.isLabor});

  @override
  State<SubmitPriceScreen> createState() => _SubmitPriceScreenState();
}

class _SubmitPriceScreenState extends State<SubmitPriceScreen> {
  String _tradeCategory = tradeFields.first.branches.first.professions.first.value;
  String _materialType = materialTypes.first.value;
  String _city = turkishProvinces.first;
  String _district = '';
  String _experienceLevel = 'MID';
  String _period = 'DAILY';
  String _submissionType = 'ACTUAL';
  final _amountController = TextEditingController();

  bool _isSubmitting = false;
  String? _error;
  bool _done = false;

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _isSubmitting = true;
      _error = null;
      _done = false;
    });
    try {
      final amount = int.tryParse(_amountController.text.trim()) ?? 0;
      if (widget.isLabor) {
        await context.read<AuthStore>().authorizedPost('/wage-index', body: {
          'tradeCategory': _tradeCategory,
          'city': _city,
          if (_district.isNotEmpty) 'district': _district,
          'experienceLevel': _experienceLevel,
          'amount': amount,
          'period': _period,
          'submissionType': _submissionType,
        });
      } else {
        await context.read<AuthStore>().authorizedPost('/material-index', body: {
          'materialType': _materialType,
          'city': _city,
          if (_district.isNotEmpty) 'district': _district,
          'amount': amount,
          'submissionType': _submissionType,
        });
      }
      setState(() => _done = true);
      _amountController.clear();
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Gönderilemedi');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.isLabor ? 'Yevmiye/Maaş Bilgisi Paylaş' : 'Malzeme Fiyatı Paylaş')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.gold500.withValues(alpha: 0.3)),
              borderRadius: BorderRadius.circular(8),
              color: AppColors.ink800,
            ),
            child: const Text(
              'Lütfen gerçek ve güncel bilgi paylaş. Yanlış veya uydurma veri, herkesin gördüğü endeksin '
              'güvenilirliğini bozar.',
              style: TextStyle(color: AppColors.silver400, fontSize: 12),
            ),
          ),
          if (widget.isLabor)
            TradeCategoryPicker(value: _tradeCategory, onChanged: (v) => setState(() => _tradeCategory = v))
          else
            AppDropdown(
              label: 'Malzeme',
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
          if (widget.isLabor) ...[
            AppDropdown(
              label: 'Deneyim',
              value: _experienceLevel,
              options: experienceLevels,
              onChanged: (v) => setState(() => _experienceLevel = v),
            ),
            AppDropdown(
              label: 'Periyot',
              value: _period,
              options: wagePeriods,
              onChanged: (v) => setState(() => _period = v),
            ),
          ],
          TextField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Tutar (₺)'),
          ),
          const SizedBox(height: 12),
          AppDropdown(
            label: 'Bu bilgi neyi yansıtıyor?',
            value: _submissionType,
            options: priceSubmissionTypes,
            onChanged: (v) => setState(() => _submissionType = v),
          ),
          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(_error!, style: const TextStyle(color: AppColors.red400)),
          ],
          if (_done) ...[
            const SizedBox(height: 8),
            const Text('Teşekkürler, katkın kaydedildi!', style: TextStyle(color: AppColors.green400)),
          ],
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submit,
            child: Text(_isSubmitting ? 'Gönderiliyor...' : 'Paylaş'),
          ),
        ],
      ),
    );
  }
}