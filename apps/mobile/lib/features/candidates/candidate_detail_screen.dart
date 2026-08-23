import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../models/candidate_directory.dart';
import '../../theme/app_theme.dart';
import '../../core/phone.dart';
import '../../widgets/whatsapp_contact_button.dart';

class CandidateDetailScreen extends StatefulWidget {
  final String id;
  const CandidateDetailScreen({super.key, required this.id});

  @override
  State<CandidateDetailScreen> createState() => _CandidateDetailScreenState();
}

class _CandidateDetailScreenState extends State<CandidateDetailScreen> {
  bool _isLoading = true;
  String? _error;
  CandidateDirectoryEntry? _candidate;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final json = await context.read<AuthStore>().authorizedGet('/candidates/${widget.id}');
      setState(() => _candidate = CandidateDirectoryEntry.fromJson(json as Map<String, dynamic>));
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = context.read<LocaleStore>().t('candidates.connectionError'));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return Scaffold(
      appBar: AppBar(title: Text(t('candidates.detail.title'))),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold500))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: AppColors.red400)))
              : _buildContent(t),
    );
  }

  Widget _buildContent(String Function(String key, {Map<String, String>? vars}) t) {
    final candidate = _candidate;
    if (candidate == null) return const SizedBox.shrink();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(
              child: Text(candidate.fullName, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 22)),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: candidate.availabilityStatus == 'AVAILABLE'
                    ? AppColors.green400.withValues(alpha: 0.15)
                    : AppColors.ink800,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                candidate.availabilityStatus == 'AVAILABLE'
                    ? t('candidates.detail.availableBadge')
                    : t('candidates.detail.busyBadge'),
                style: TextStyle(
                  color: candidate.availabilityStatus == 'AVAILABLE' ? AppColors.green400 : AppColors.silver500,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          t('candidates.detail.meta', vars: {'city': candidate.city, 'years': candidate.experienceYears.toString()}),
          style: const TextStyle(color: AppColors.silver500),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(color: AppColors.ink800, borderRadius: BorderRadius.circular(20)),
          child: Text(
            tradeCategories.labelFor(candidate.primaryTradeCategory ?? ''),
            style: const TextStyle(color: AppColors.gold400, fontSize: 12),
          ),
        ),
        if (candidate.skills.isNotEmpty) ...[
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: candidate.skills
                .map(
                  (skill) => Chip(
                    label: Text(skill, style: const TextStyle(color: AppColors.silver400, fontSize: 12)),
                    backgroundColor: AppColors.ink900,
                    side: const BorderSide(color: AppColors.ink700),
                  ),
                )
                .toList(),
          ),
        ],
        if (candidate.phone != null) ...[
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
                Text(t('candidates.detail.contactLabel'), style: const TextStyle(color: AppColors.silver500, fontSize: 12)),
                const SizedBox(height: 4),
                Text(maskPhone(candidate.phone!), style: const TextStyle(color: AppColors.gold400, fontSize: 16)),
                const SizedBox(height: 10),
                WhatsAppContactButton(
                  phone: candidate.phone!,
                  message: t('candidates.detail.contactMessage',
                      vars: {'trade': tradeCategories.labelFor(candidate.primaryTradeCategory ?? '')}),
                  disabled: candidate.availabilityStatus != 'AVAILABLE',
                  disabledLabel: t('candidates.detail.notAvailable'),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}