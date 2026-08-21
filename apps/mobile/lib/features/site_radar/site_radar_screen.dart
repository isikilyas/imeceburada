import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../models/site_request.dart';
import '../../theme/app_theme.dart';
import '../auth/login_screen.dart';
import 'new_site_request_screen.dart';
import 'site_request_detail_screen.dart';

const _turkeyCenter = LatLng(39.0, 35.2);

class SiteRadarScreen extends StatefulWidget {
  const SiteRadarScreen({super.key});

  @override
  State<SiteRadarScreen> createState() => _SiteRadarScreenState();
}

class _SiteRadarScreenState extends State<SiteRadarScreen> {
  final _api = ApiClient();
  bool _isLoading = true;
  String? _error;
  List<SiteRequest> _requests = [];
  String? _typeFilter; // null = tümü, WORKER, EQUIPMENT

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
      final raw = await _api.get('/site-requests', query: {
        if (_typeFilter != null) 'requestType': _typeFilter!,
      });
      final list = (raw as List).map((e) => SiteRequest.fromJson(e as Map<String, dynamic>)).toList();
      setState(() => _requests = list);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Bağlantı hatası, tekrar deneyin');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _openNewRequest() async {
    final auth = context.read<AuthStore>();
    if (!auth.isAuthenticated) {
      await Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen()));
      if (!mounted) return;
      if (!context.read<AuthStore>().isAuthenticated) return;
    }
    if (!mounted) return;
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const NewSiteRequestScreen()),
    );
    if (created == true) _load();
  }

  String _subtitle(SiteRequest r) {
    final label = r.requestType == 'WORKER'
        ? tradeCategories.labelFor(r.tradeCategory ?? '')
        : equipmentTypes.labelFor(r.equipmentType ?? '');
    final location = r.district != null ? '${r.city} / ${r.district}' : r.city;
    return '$label · $location · ${r.neededCount} adet';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Şantiye Radarı')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openNewRequest,
        backgroundColor: AppColors.gold500,
        foregroundColor: AppColors.ink950,
        icon: const Icon(Icons.add_location_alt),
        label: const Text('Anlık Çağrı Aç'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                _FilterChip(label: 'Tümü', selected: _typeFilter == null, onTap: () {
                  setState(() => _typeFilter = null);
                  _load();
                }),
                const SizedBox(width: 8),
                _FilterChip(label: 'Usta / İşçi', selected: _typeFilter == 'WORKER', onTap: () {
                  setState(() => _typeFilter = 'WORKER');
                  _load();
                }),
                const SizedBox(width: 8),
                _FilterChip(label: 'İş Makinesi', selected: _typeFilter == 'EQUIPMENT', onTap: () {
                  setState(() => _typeFilter = 'EQUIPMENT');
                  _load();
                }),
              ],
            ),
          ),
          SizedBox(
            height: 260,
            child: FlutterMap(
              options: const MapOptions(initialCenter: _turkeyCenter, initialZoom: 6),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.bau360.app',
                ),
                MarkerLayer(
                  markers: _requests
                      .map(
                        (r) => Marker(
                          point: LatLng(r.latitude, r.longitude),
                          width: 40,
                          height: 40,
                          child: GestureDetector(
                            onTap: () => Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => SiteRequestDetailScreen(id: r.id)),
                            ),
                            child: const Icon(Icons.location_on, color: AppColors.gold500, size: 36),
                          ),
                        ),
                      )
                      .toList(),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.ink800),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.gold500))
                : _error != null
                    ? Center(child: Text(_error!, style: const TextStyle(color: AppColors.red400)))
                    : _requests.isEmpty
                        ? const Center(
                            child: Text('Şu anda açık çağrı yok.', style: TextStyle(color: AppColors.silver500)),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: _requests.length,
                            itemBuilder: (context, i) {
                              final r = _requests[i];
                              return Card(
                                margin: const EdgeInsets.only(bottom: 10),
                                child: ListTile(
                                  title: Text(r.title, style: Theme.of(context).textTheme.titleMedium),
                                  subtitle: Text(_subtitle(r), style: const TextStyle(color: AppColors.silver500)),
                                  trailing: Text('${r.responseCount} yanıt', style: const TextStyle(color: AppColors.gold400)),
                                  onTap: () => Navigator.of(context).push(
                                    MaterialPageRoute(builder: (_) => SiteRequestDetailScreen(id: r.id)),
                                  ),
                                ),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _FilterChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onTap(),
      selectedColor: AppColors.gold500,
      backgroundColor: AppColors.ink900,
      labelStyle: TextStyle(color: selected ? AppColors.ink950 : AppColors.silver400),
      side: const BorderSide(color: AppColors.ink700),
    );
  }
}
