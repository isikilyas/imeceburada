import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../models/job.dart';
import '../../theme/app_theme.dart';
import '../auth/login_screen.dart';
import '../../widgets/whatsapp_share_button.dart';

class JobDetailScreen extends StatefulWidget {
  final String id;
  const JobDetailScreen({super.key, required this.id});

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  final _api = ApiClient();

  bool _isLoading = true;
  String? _error;
  JobPosting? _job;

  bool _isApplying = false;
  bool _applied = false;
  String? _applyError;

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
      final json = await _api.get('/jobs/${widget.id}');
      setState(() => _job = JobPosting.fromJson(json as Map<String, dynamic>));
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = context.read<LocaleStore>().t('jobs.connectionError'));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _apply() async {
    final auth = context.read<AuthStore>();
    if (!auth.isAuthenticated) {
      await Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen()));
      if (!mounted) return;
      if (!context.read<AuthStore>().isAuthenticated) return;
    }
    if (!mounted) return;
    setState(() {
      _isApplying = true;
      _applyError = null;
    });
    try {
      await context.read<AuthStore>().authorizedPost('/applications', body: {'jobId': widget.id});
      setState(() => _applied = true);
    } on ApiException catch (e) {
      setState(() => _applyError = e.message);
    } catch (_) {
      setState(() => _applyError = context.read<LocaleStore>().t('jobs.applyFailed'));
    } finally {
      if (mounted) setState(() => _isApplying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final job = _job;
    final user = context.watch<AuthStore>().user;
    final t = context.watch<LocaleStore>().t;

    return Scaffold(
      appBar: AppBar(
        title: Text(t('jobs.detail.title')),
        actions: [
          if (job != null)
            WhatsAppShareButton(
              text: t('jobs.detail.shareText', vars: {
                'title': job.title,
                'company': job.companyName,
                'city': job.city,
              }),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold500))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: AppColors.red400)))
              : job == null
                  ? const SizedBox.shrink()
                  : ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration:
                              BoxDecoration(color: AppColors.ink800, borderRadius: BorderRadius.circular(20)),
                          child: Text(
                            tradeCategories.labelFor(job.tradeCategory),
                            style: const TextStyle(color: AppColors.gold400, fontSize: 12),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(job.title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 22)),
                        const SizedBox(height: 4),
                        Text(job.companyName, style: const TextStyle(color: AppColors.silver500)),
                        const SizedBox(height: 8),
                        Text(
                          '${job.city} · ${employmentTypes.labelFor(job.employmentType)}'
                          '${(job.salaryMin != null || job.salaryMax != null) ? ' · ${job.salaryMin ?? "?"} - ${job.salaryMax ?? "?"} ₺' : ''}',
                          style: const TextStyle(color: AppColors.silver500),
                        ),
                        const SizedBox(height: 16),
                        Text(job.description, style: const TextStyle(color: AppColors.silver300, height: 1.4)),
                        const SizedBox(height: 24),
                        if (user?.role == 'COMPANY')
                          Text(t('jobs.detail.companyCannotApply'), style: const TextStyle(color: AppColors.silver500))
                        else if (_applied)
                          Text(t('jobs.detail.applied'), style: const TextStyle(color: AppColors.green400))
                        else ...[
                          ElevatedButton(
                            onPressed: _isApplying ? null : _apply,
                            child: Text(_isApplying ? t('jobs.detail.submitting') : t('jobs.detail.apply')),
                          ),
                          if (_applyError != null) ...[
                            const SizedBox(height: 8),
                            Text(_applyError!, style: const TextStyle(color: AppColors.red400)),
                          ],
                        ],
                      ],
                    ),
    );
  }
}