import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../core/phone.dart';
import '../../models/material_listing.dart';
import '../../theme/app_theme.dart';
import '../../widgets/whatsapp_contact_button.dart';
import '../../widgets/whatsapp_share_button.dart';

typedef _Translate = String Function(String key, {Map<String, String>? vars});

class MaterialListingDetailScreen extends StatefulWidget {
  final String id;
  const MaterialListingDetailScreen({super.key, required this.id});

  @override
  State<MaterialListingDetailScreen> createState() => _MaterialListingDetailScreenState();
}

class _MaterialListingDetailScreenState extends State<MaterialListingDetailScreen> {
  final _api = ApiClient();
  bool _isLoading = true;
  String? _error;
  MaterialListing? _listing;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final json = await _api.get('/material-listings/${widget.id}');
      setState(() => _listing = MaterialListing.fromJson(json as Map<String, dynamic>));
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = context.read<LocaleStore>().t('materialListings.error.connection'));
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
        title: Text(t('materialListings.detail.title')),
        actions: [
          if (listing != null)
            WhatsAppShareButton(
              text: t('materialListings.detail.shareText', vars: {
                'label': materialTypes.labelFor(listing.materialType),
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
    final label = materialTypes.labelFor(listing.materialType);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(label, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 22)),
        const SizedBox(height: 4),
        Text(
          '${listing.supplierName} · ${listing.city}${listing.district != null ? ' / ${listing.district}' : ''}',
          style: const TextStyle(color: AppColors.silver500),
        ),
        const SizedBox(height: 8),
        Text(
          t('materialListings.price', vars: {'price': listing.price.toString(), 'unit': listing.unit}),
          style: const TextStyle(color: AppColors.gold400, fontSize: 18, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 16),
        Text(listing.description, style: const TextStyle(color: AppColors.silver300, height: 1.4)),
        if (listing.supplierPhone != null) ...[
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
                Text(t('materialListings.detail.contactLabel'), style: const TextStyle(color: AppColors.silver500, fontSize: 12)),
                const SizedBox(height: 4),
                Text(maskPhone(listing.supplierPhone!), style: const TextStyle(color: AppColors.gold400, fontSize: 16)),
                const SizedBox(height: 10),
                WhatsAppContactButton(
                  phone: listing.supplierPhone!,
                  message: t('materialListings.detail.contactMessage', vars: {'label': label}),
                ),
              ],
            ),
          ),
        ] else ...[
          const SizedBox(height: 20),
          Text(
            t('materialListings.detail.noContact'),
            style: const TextStyle(color: AppColors.silver500, fontSize: 13),
          ),
        ],
      ],
    );
  }
}
