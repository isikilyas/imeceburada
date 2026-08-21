import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../models/equipment_listing.dart';
import '../../theme/app_theme.dart';
import 'new_equipment_screen.dart';

class EquipmentMineScreen extends StatefulWidget {
  const EquipmentMineScreen({super.key});

  @override
  State<EquipmentMineScreen> createState() => _EquipmentMineScreenState();
}

class _EquipmentMineScreenState extends State<EquipmentMineScreen> {
  bool _isLoading = true;
  String? _error;
  List<EquipmentListing> _listings = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final raw = await context.read<AuthStore>().authorizedGet('/equipment/mine');
      final items = (raw as List).map((e) => EquipmentListing.fromJson(e as Map<String, dynamic>)).toList();
      setState(() => _listings = items);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Bağlantı hatası, tekrar deneyin');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _close(String id) async {
    try {
      await context.read<AuthStore>().authorizedDelete('/equipment/$id');
      _load();
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  Future<void> _openNew() async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const NewEquipmentScreen()),
    );
    if (created == true) _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ekipman İlanlarım'),
        actions: [
          IconButton(onPressed: _openNew, icon: const Icon(Icons.add)),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppColors.gold500,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.gold500))
            : _error != null
                ? Center(child: Text(_error!, style: const TextStyle(color: AppColors.red400)))
                : ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      if (_listings.isEmpty)
                        const Padding(
                          padding: EdgeInsets.all(12),
                          child: Text('Henüz ilan vermedin.', style: TextStyle(color: AppColors.silver500)),
                        ),
                      ..._listings.map((listing) {
                        final active = listing.status == 'AVAILABLE';
                        return Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '${equipmentTypes.labelFor(listing.equipmentType)}${listing.capacity != null ? ' · ${listing.capacity}' : ''}',
                                        style: Theme.of(context).textTheme.titleMedium,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${listing.city}${listing.district != null ? ' / ${listing.district}' : ''} · '
                                        '${active ? 'Aktif' : 'Pasif'}',
                                        style: const TextStyle(color: AppColors.silver500, fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ),
                                if (active)
                                  TextButton(
                                    onPressed: () => _close(listing.id),
                                    child: const Text('Kapat'),
                                  ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
      ),
    );
  }
}