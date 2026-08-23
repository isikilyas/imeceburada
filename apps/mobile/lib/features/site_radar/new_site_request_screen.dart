import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/equipment_category_picker.dart';
import '../../widgets/province_district_picker.dart';
import '../../widgets/trade_category_picker.dart';

const _turkeyCenter = LatLng(39.0, 35.2);

class NewSiteRequestScreen extends StatefulWidget {
  const NewSiteRequestScreen({super.key});

  @override
  State<NewSiteRequestScreen> createState() => _NewSiteRequestScreenState();
}

class _NewSiteRequestScreenState extends State<NewSiteRequestScreen> {
  String _requestType = 'WORKER';
  String _tradeCategory = tradeFields.first.branches.first.professions.first.value;
  String _equipmentType = equipmentCategories.first.items.first.value;
  String _city = turkishProvinces.first;
  String _district = '';
  int _neededCount = 1;
  LatLng? _picked;

  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();

  bool _isSubmitting = false;
  String? _error;

  Future<void> _submit() async {
    final t = context.read<LocaleStore>().t;
    if (_picked == null) {
      setState(() => _error = t('siteRadar.newRequest.pickLocationError'));
      return;
    }
    setState(() {
      _isSubmitting = true;
      _error = null;
    });
    try {
      await context.read<AuthStore>().authorizedPost('/site-requests', body: {
        'requestType': _requestType,
        if (_requestType == 'WORKER') 'tradeCategory': _tradeCategory,
        if (_requestType == 'EQUIPMENT') 'equipmentType': _equipmentType,
        'title': _titleController.text.trim(),
        'description': _descriptionController.text.trim(),
        'city': _city,
        if (_district.isNotEmpty) 'district': _district,
        'latitude': _picked!.latitude,
        'longitude': _picked!.longitude,
        'neededCount': _neededCount,
      });
      if (mounted) Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = t('siteRadar.newRequest.submitError'));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return Scaffold(
      appBar: AppBar(title: Text(t('siteRadar.openRequestCta'))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              Expanded(
                child: _TypeButton(
                  label: t('siteRadar.type.worker'),
                  selected: _requestType == 'WORKER',
                  onTap: () => setState(() => _requestType = 'WORKER'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _TypeButton(
                  label: t('siteRadar.type.equipment'),
                  selected: _requestType == 'EQUIPMENT',
                  onTap: () => setState(() => _requestType = 'EQUIPMENT'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (_requestType == 'WORKER')
            TradeCategoryPicker(
              value: _tradeCategory,
              onChanged: (v) => setState(() => _tradeCategory = v),
            )
          else
            EquipmentCategoryPicker(
              value: _equipmentType,
              onChanged: (v) => setState(() => _equipmentType = v),
            ),
          TextField(
            controller: _titleController,
            decoration: InputDecoration(labelText: t('siteRadar.newRequest.titleLabel')),
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
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(t('siteRadar.newRequest.neededCountLabel'), style: const TextStyle(color: AppColors.silver500)),
              const Spacer(),
              IconButton(
                onPressed: () => setState(() => _neededCount = (_neededCount - 1).clamp(1, 999)),
                icon: const Icon(Icons.remove_circle_outline, color: AppColors.silver400),
              ),
              Text('$_neededCount', style: const TextStyle(color: AppColors.silver300, fontSize: 16)),
              IconButton(
                onPressed: () => setState(() => _neededCount = _neededCount + 1),
                icon: const Icon(Icons.add_circle_outline, color: AppColors.silver400),
              ),
            ],
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _descriptionController,
            maxLines: 3,
            decoration: InputDecoration(labelText: t('siteRadar.newRequest.descriptionLabel')),
          ),
          const SizedBox(height: 16),
          Text(t('siteRadar.newRequest.locationLabel'), style: const TextStyle(color: AppColors.silver500, fontSize: 13)),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: SizedBox(
              height: 220,
              child: FlutterMap(
                options: MapOptions(
                  initialCenter: _turkeyCenter,
                  initialZoom: 6,
                  onTap: (tapPosition, point) => setState(() => _picked = point),
                ),
                children: [
                  TileLayer(
                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.imeceburada.app',
                  ),
                  if (_picked != null)
                    MarkerLayer(markers: [
                      Marker(
                        point: _picked!,
                        width: 40,
                        height: 40,
                        child: const Icon(Icons.location_on, color: AppColors.gold500, size: 36),
                      ),
                    ]),
                ],
              ),
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: AppColors.red400)),
          ],
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submit,
            child: Text(_isSubmitting ? t('siteRadar.newRequest.publishing') : t('siteRadar.newRequest.publish')),
          ),
        ],
      ),
    );
  }
}

class _TypeButton extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _TypeButton({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.gold500 : AppColors.ink900,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: selected ? AppColors.gold500 : AppColors.ink700),
          ),
          child: Text(
            label,
            style: TextStyle(color: selected ? AppColors.ink950 : AppColors.silver400, fontWeight: FontWeight.w600),
          ),
        ),
      ),
    );
  }
}
