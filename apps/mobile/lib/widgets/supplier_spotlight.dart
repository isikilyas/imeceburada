import 'package:flutter/material.dart';
import '../core/api_client.dart';
import '../core/constants.dart';
import '../models/material_listing.dart';
import '../theme/app_theme.dart';
import '../features/material_listings/material_listing_detail_screen.dart';
import '../features/material_listings/material_listings_screen.dart';

/// Ana ekrandaki (Piyasa sekmesi) ücretsiz tedarikçi reklam alanı — web'deki
/// ana sayfa "Tedarikçi Vitrini" bölümünün mobil karşılığı. Ücretli "öne
/// çıkar" katmanı yok, sadece aktif malzeme ilanlarından bir örneklem.
class SupplierSpotlight extends StatefulWidget {
  const SupplierSpotlight({super.key});

  @override
  State<SupplierSpotlight> createState() => _SupplierSpotlightState();
}

class _SupplierSpotlightState extends State<SupplierSpotlight> {
  final _api = ApiClient();
  bool _isLoading = true;
  List<MaterialListing> _listings = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final raw = await _api.get('/material-listings', query: {'pageSize': '6'});
      final map = raw as Map<String, dynamic>;
      final items = (map['items'] as List).map((e) => MaterialListing.fromJson(e as Map<String, dynamic>)).toList();
      if (mounted) setState(() => _listings = items);
    } catch (_) {
      // sessizce geç — vitrin sadece veri varsa gösterilir
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading || _listings.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Tedarikçi Vitrini',
              style: TextStyle(color: AppColors.silver300, fontWeight: FontWeight.w600, fontSize: 16),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const MaterialListingsScreen()),
              ),
              child: const Text('Tümü →', style: TextStyle(color: AppColors.gold400, fontSize: 13)),
            ),
          ],
        ),
        SizedBox(
          height: 100,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _listings.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, i) {
              final listing = _listings[i];
              return GestureDetector(
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => MaterialListingDetailScreen(id: listing.id)),
                ),
                child: Container(
                  width: 160,
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.ink800),
                    borderRadius: BorderRadius.circular(8),
                    color: AppColors.ink900,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        listing.supplierName,
                        style: const TextStyle(color: AppColors.silver500, fontSize: 11),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        materialTypes.labelFor(listing.materialType),
                        style: const TextStyle(color: AppColors.silver300, fontSize: 13, fontWeight: FontWeight.w600),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        '${listing.price} ₺/${listing.unit}',
                        style: const TextStyle(color: AppColors.gold400, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 8),
      ],
    );
  }
}