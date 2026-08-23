import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../models/subcontractor.dart';
import '../../theme/app_theme.dart';
import '../../core/phone.dart';
import '../../widgets/whatsapp_contact_button.dart';
import '../../widgets/whatsapp_share_button.dart';

class SubcontractorDetailScreen extends StatefulWidget {
  final String id;
  const SubcontractorDetailScreen({super.key, required this.id});

  @override
  State<SubcontractorDetailScreen> createState() => _SubcontractorDetailScreenState();
}

class _SubcontractorDetailScreenState extends State<SubcontractorDetailScreen> {
  bool _isLoading = true;
  String? _error;
  SubcontractorDirectoryDetail? _subcontractor;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final json = await context.read<AuthStore>().authorizedGet('/subcontractors/${widget.id}');
      setState(() => _subcontractor = SubcontractorDirectoryDetail.fromJson(json as Map<String, dynamic>));
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
    final subcontractor = _subcontractor;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Taşeron Detayı'),
        actions: [
          if (subcontractor != null)
            WhatsAppShareButton(
              text: "🏢 ${subcontractor.companyName} — ${subcontractor.city}\nİmece Burada'da incele:",
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
    final subcontractor = _subcontractor;
    if (subcontractor == null) return const SizedBox.shrink();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(subcontractor.companyName, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 22)),
        const SizedBox(height: 4),
        Text(
          '${subcontractor.city}${subcontractor.district != null ? ' / ${subcontractor.district}' : ''}',
          style: const TextStyle(color: AppColors.silver500),
        ),
        if (subcontractor.tradeCategories.isNotEmpty) ...[
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: subcontractor.tradeCategories
                .map(
                  (v) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: AppColors.ink800, borderRadius: BorderRadius.circular(20)),
                    child: Text(
                      tradeCategories.labelFor(v),
                      style: const TextStyle(color: AppColors.gold400, fontSize: 12),
                    ),
                  ),
                )
                .toList(),
          ),
        ],
        if (subcontractor.description != null && subcontractor.description!.isNotEmpty) ...[
          const SizedBox(height: 16),
          Text(subcontractor.description!, style: const TextStyle(color: AppColors.silver300, height: 1.4)),
        ],
        if (subcontractor.phone != null) ...[
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
                Text(maskPhone(subcontractor.phone!), style: const TextStyle(color: AppColors.gold400, fontSize: 16)),
                const SizedBox(height: 10),
                WhatsAppContactButton(
                  phone: subcontractor.phone!,
                  message:
                      'Merhaba, platformunuzdaki ${subcontractor.companyName} profilinizi gördüm. Görüşmek isterseniz müsait misiniz?',
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}