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
import '../../widgets/whatsapp_share_button.dart';

class SiteRequestDetailScreen extends StatefulWidget {
  final String id;
  const SiteRequestDetailScreen({super.key, required this.id});

  @override
  State<SiteRequestDetailScreen> createState() => _SiteRequestDetailScreenState();
}

class _SiteRequestDetailScreenState extends State<SiteRequestDetailScreen> {
  final _api = ApiClient();
  final _messageController = TextEditingController();

  bool _isLoading = true;
  String? _error;
  SiteRequest? _request;

  bool _isResponding = false;
  bool _responded = false;
  String? _respondError;

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
      final json = await _api.get('/site-requests/${widget.id}');
      setState(() => _request = SiteRequest.fromJson(json as Map<String, dynamic>));
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Bağlantı hatası, tekrar deneyin');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _respond() async {
    final auth = context.read<AuthStore>();
    if (!auth.isAuthenticated) {
      await Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen()));
      if (!mounted) return;
      if (!context.read<AuthStore>().isAuthenticated) return;
    }
    if (!mounted) return;
    setState(() {
      _isResponding = true;
      _respondError = null;
    });
    try {
      final message = _messageController.text.trim();
      await context.read<AuthStore>().authorizedPost(
        '/site-requests/${widget.id}/responses',
        body: {if (message.isNotEmpty) 'message': message},
      );
      setState(() => _responded = true);
    } on ApiException catch (e) {
      setState(() => _respondError = e.message);
    } catch (_) {
      setState(() => _respondError = 'Yanıt gönderilemedi');
    } finally {
      if (mounted) setState(() => _isResponding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final request = _request;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Çağrı Detayı'),
        actions: [
          if (request != null)
            WhatsAppShareButton(
              text: "🚨 Anlık Çağrı: ${request.title} — ${request.city}\nİmece Burada'da incele:",
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold500))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: AppColors.red400)))
              : request == null
                  ? const SizedBox.shrink()
                  : _buildContent(request),
    );
  }

  Widget _buildContent(SiteRequest request) {
    final kindLabel = request.requestType == 'WORKER'
        ? tradeCategories.labelFor(request.tradeCategory ?? '')
        : equipmentTypes.labelFor(request.equipmentType ?? '');
    final location = request.district != null ? '${request.city} / ${request.district}' : request.city;
    final isOwner = context.watch<AuthStore>().user?.id == request.createdById;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(color: AppColors.ink800, borderRadius: BorderRadius.circular(20)),
          child: Text(kindLabel, style: const TextStyle(color: AppColors.gold400, fontSize: 12)),
        ),
        const SizedBox(height: 10),
        Text(request.title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 22)),
        const SizedBox(height: 4),
        Text(
          '${request.createdByName} · $location · ${request.neededCount} adet gerekiyor',
          style: const TextStyle(color: AppColors.silver500),
        ),
        const SizedBox(height: 16),
        Text(request.description, style: const TextStyle(color: AppColors.silver300, height: 1.4)),
        const SizedBox(height: 16),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: SizedBox(
            height: 180,
            child: FlutterMap(
              options: MapOptions(
                initialCenter: LatLng(request.latitude, request.longitude),
                initialZoom: 12,
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.bau360.app',
                ),
                MarkerLayer(markers: [
                  Marker(
                    point: LatLng(request.latitude, request.longitude),
                    width: 40,
                    height: 40,
                    child: const Icon(Icons.location_on, color: AppColors.gold500, size: 36),
                  ),
                ]),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),
        if (isOwner)
          Text('${request.responseCount} yanıt aldın (yanıt yönetimi 3. adımda profil ekranına eklenecek).',
              style: const TextStyle(color: AppColors.silver500))
        else if (_responded)
          const Text('Yanıtın gönderildi!', style: TextStyle(color: AppColors.green400))
        else ...[
          TextField(
            controller: _messageController,
            maxLines: 2,
            decoration: const InputDecoration(labelText: 'Mesaj (opsiyonel)'),
          ),
          const SizedBox(height: 10),
          if (_respondError != null) ...[
            Text(_respondError!, style: const TextStyle(color: AppColors.red400)),
            const SizedBox(height: 8),
          ],
          ElevatedButton(
            onPressed: _isResponding ? null : _respond,
            child: Text(_isResponding ? 'Gönderiliyor...' : 'Yanıt Ver'),
          ),
        ],
      ],
    );
  }
}
