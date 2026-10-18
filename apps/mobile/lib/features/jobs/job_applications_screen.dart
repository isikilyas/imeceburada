import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/locale_store.dart';
import '../../models/application.dart';
import '../../theme/app_theme.dart';

class JobApplicationsScreen extends StatefulWidget {
  final String jobId;
  const JobApplicationsScreen({super.key, required this.jobId});

  @override
  State<JobApplicationsScreen> createState() => _JobApplicationsScreenState();
}

class _JobApplicationsScreenState extends State<JobApplicationsScreen> {
  bool _isLoading = true;
  String? _error;
  List<JobApplication> _applications = [];
  final Map<String, TextEditingController> _offerControllers = {};
  final Map<String, bool> _isUpdating = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    for (final c in _offerControllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  TextEditingController _offerController(String applicationId) =>
      _offerControllers.putIfAbsent(applicationId, () => TextEditingController());

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final raw = await context.read<AuthStore>().authorizedGet('/applications/job/${widget.jobId}');
      final items = (raw as List).map((e) => JobApplication.fromJson(e as Map<String, dynamic>)).toList();
      setState(() => _applications = items);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = context.read<LocaleStore>().t('jobs.applicants.loadFailed'));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _updateStatus(String applicationId, String status, {int? offeredWage}) async {
    setState(() => _isUpdating[applicationId] = true);
    try {
      await context.read<AuthStore>().authorizedPatch('/applications/$applicationId/status', body: {
        'status': status,
        if (offeredWage != null) 'offeredWage': offeredWage,
      });
      await _load();
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(context.read<LocaleStore>().t('jobs.applicants.updateFailed'))));
      }
    } finally {
      if (mounted) setState(() => _isUpdating[applicationId] = false);
    }
  }

  Future<void> _sendOffer(JobApplication app) async {
    final wage = int.tryParse(_offerController(app.id).text.trim());
    if (wage == null) return;
    await _updateStatus(app.id, app.status, offeredWage: wage);
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return Scaffold(
      appBar: AppBar(title: Text(t('jobs.applicants.title'))),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold500))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: AppColors.red400)))
              : _applications.isEmpty
                  ? Center(
                      child: Text(t('jobs.applicants.empty'), style: const TextStyle(color: AppColors.silver500)))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _applications.length,
                      itemBuilder: (context, i) {
                        final app = _applications[i];
                        final updating = _isUpdating[app.id] ?? false;
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(app.applicantName, style: Theme.of(context).textTheme.titleMedium),
                                const SizedBox(height: 2),
                                Text(t('jobs.status.${app.status}'),
                                    style: const TextStyle(color: AppColors.silver500, fontSize: 12)),
                                if (app.expectedWage != null)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text(
                                      '${t('jobs.applicants.expectedWageLabel')}: ${app.expectedWage} ₺/ay',
                                      style: const TextStyle(color: AppColors.gold400, fontSize: 12),
                                    ),
                                  ),
                                if (app.offeredWage != null)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 2),
                                    child: Text(
                                      '${t('jobs.applicants.offeredWageLabel')}: ${app.offeredWage} ₺/ay',
                                      style: const TextStyle(color: AppColors.silver400, fontSize: 12),
                                    ),
                                  ),
                                const SizedBox(height: 10),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: [
                                    OutlinedButton(
                                      onPressed: updating ? null : () => _updateStatus(app.id, 'REVIEWED'),
                                      child: Text(t('jobs.applicants.markReviewedButton')),
                                    ),
                                    ElevatedButton(
                                      onPressed: updating ? null : () => _updateStatus(app.id, 'ACCEPTED'),
                                      child: Text(t('jobs.applicants.acceptButton')),
                                    ),
                                    OutlinedButton(
                                      onPressed: updating ? null : () => _updateStatus(app.id, 'REJECTED'),
                                      style: OutlinedButton.styleFrom(foregroundColor: AppColors.red400),
                                      child: Text(t('jobs.applicants.rejectButton')),
                                    ),
                                  ],
                                ),
                                const Divider(height: 24, color: AppColors.ink700),
                                Row(
                                  children: [
                                    Expanded(
                                      child: TextField(
                                        controller: _offerController(app.id),
                                        keyboardType: TextInputType.number,
                                        decoration: InputDecoration(
                                          hintText: t('jobs.applicants.offerInputPlaceholder'),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    TextButton(
                                      onPressed: updating ? null : () => _sendOffer(app),
                                      child: Text(t('jobs.applicants.sendOfferButton')),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}
