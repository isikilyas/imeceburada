import 'package:flutter/material.dart';
import '../../core/api_client.dart';
import '../../core/constants.dart';
import '../../core/phone.dart';
import '../../models/equipment_listing.dart';
import '../../theme/app_theme.dart';
import '../../widgets/whatsapp_contact_button.dart';
import '../../widgets/whatsapp_share_button.dart';

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
      setState(() => _error = 'Bağlantı hatası, tekrar deneyin');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final listing = _listing;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ekipman Detayı'),
        actions: [
          if (listing != null)
            WhatsAppShareButton(
              text:
                  "🏗️ ${equipmentTypes.labelFor(listing.equipmentType)} — ${listing.city}\nİmece Yapı'da incele:",
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold500))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: AppColors.red400)))
              : _buildContent(),
    );
  }

  Widget _buildContent() {
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
                Text('${listing.dailyRate} ₺/gün', style: const TextStyle(color: AppColors.silver400)),
              if (listing.hourlyRate != null)
                Text('${listing.hourlyRate} ₺/saat', style: const TextStyle(color: AppColors.silver400)),
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
                const Text('İletişim', style: TextStyle(color: AppColors.silver500, fontSize: 12)),
                const SizedBox(height: 4),
                Text(maskPhone(listing.ownerPhone!), style: const TextStyle(color: AppColors.gold400, fontSize: 16)),
                const SizedBox(height: 10),
                WhatsAppContactButton(
                  phone: listing.ownerPhone!,
                  message: 'Merhaba, platformunuzdaki $label ilanınızı gördüm. Kiralama için müsait misiniz?',
                ),
              ],
            ),
          ),
        ] else ...[
          const SizedBox(height: 20),
          const Text(
            'İlan sahibi iletişim numarası paylaşmamış.',
            style: TextStyle(color: AppColors.silver500, fontSize: 13),
          ),
        ],
      ],
    );
  }
}