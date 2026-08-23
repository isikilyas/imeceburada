import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../core/phone.dart';
import '../../models/equipment_listing.dart';
import '../../theme/app_theme.dart';
import '../../widgets/whatsapp_contact_button.dart';
import '../../widgets/whatsapp_share_button.dart';

typedef _Translate = String Function(String key, {Map<String, String>? vars});

class EquipmentDetailScreen extends StatefulWidget {
  final String id;
  const EquipmentDetailScreen({super.key, required this.id});

  @override
  State<EquipmentDetailScreen> createState() => _EquipmentDetailScreenState();
}

class _EquipmentDetailScreenState extends State<EquipmentDetailScreen> {
  final _api = ApiClient();
  bool _isLoading = true;
  String? _error;
  EquipmentListing? _listing;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final json = await _api.get('/equipment/${widget.id}');
      setState(() => _listing = EquipmentListing.fromJson(json as Map<String, dynamic>));
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = context.read<LocaleStore>().t('equipment.error.connection'));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    final listing = _listing;
    return Scaffold(
      appBar: AppBar(
        title: Text(t('equipment.detail.title')),
        actions: [
          if (listing != null)
            WhatsAppShareButton(
              text: t('equipment.detail.shareText', vars: {
                'label': equipmentTypes.labelFor(listing.equipmentType),
                'city': listing.city,
              }),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold500))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: AppColors.red400)))
              : _buildContent(t),
    );
  }

  Widget _buildContent(_Translate t) {
    final listing = _listing;
    if (listing == null) return const SizedBox.shrink();
    final label = equipmentTypes.labelFor(listing.equipmentType);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          '$label${listing.capacity != null ? ' · ${listing.capacity}' : ''}',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 22),
        ),
        const SizedBox(height: 4),
        Text(
          '${listing.ownerName} · ${listing.city}${listing.district != null ? ' / ${listing.district}' : ''}',
          style: const TextStyle(color: AppColors.silver500),
        ),
        if (listing.dailyRate != null || listing.hourlyRate != null) ...[
          const SizedBox(height: 8),
          Wrap(
            spacing: 12,
            children: [
              if (listing.dailyRate != null)
                Text(t('equipment.priceDaily', vars: {'price': listing.dailyRate.toString()}),
                    style: const TextStyle(color: AppColors.silver400)),
              if (listing.hourlyRate != null)
                Text(t('equipment.priceHourly', vars: {'price': listing.hourlyRate.toString()}),
                    style: const TextStyle(color: AppColors.silver400)),
            ],
          ),
        ],
        const SizedBox(height: 16),
        Text(listing.description, style: const TextStyle(color: AppColors.silver300, height: 1.4)),
        if (listing.ownerPhone != null) ...[
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.gold500.withValues(alpha: 0.4)),
              color: AppColors.ink900,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(t('equipment.detail.contactLabel'), style: const TextStyle(color: AppColors.silver500, fontSize: 12)),
                const SizedBox(height: 4),
                Text(maskPhone(listing.ownerPhone!), style: const TextStyle(color: AppColors.gold400, fontSize: 16)),
                const SizedBox(height: 10),
                WhatsAppContactButton(
                  phone: listing.ownerPhone!,
                  message: t('equipment.detail.contactMessage', vars: {'label': label}),
                ),
              ],
            ),
          ),
        ] else ...[
          const SizedBox(height: 20),
          Text(
            t('equipment.detail.noContact'),
            style: const TextStyle(color: AppColors.silver500, fontSize: 13),
          ),
        ],
      ],
    );
  }
}
