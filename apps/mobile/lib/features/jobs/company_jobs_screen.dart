import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../models/job.dart';
import '../../theme/app_theme.dart';
import 'new_job_screen.dart';

class CompanyJobsScreen extends StatefulWidget {
  const CompanyJobsScreen({super.key});

  @override
  State<CompanyJobsScreen> createState() => _CompanyJobsScreenState();
}

class _CompanyJobsScreenState extends State<CompanyJobsScreen> {
  bool _isLoading = true;
  String? _error;
  List<JobPosting> _jobs = [];

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
      final raw = await context.read<AuthStore>().authorizedGet('/jobs/mine');
      final items = (raw as List).map((e) => JobPosting.fromJson(e as Map<String, dynamic>)).toList();
      setState(() => _jobs = items);
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
      await context.read<AuthStore>().authorizedDelete('/jobs/$id');
      _load();
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  Future<void> _openNewJob() async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const NewJobScreen()),
    );
    if (created == true) _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('İlanlarım'),
        actions: [
          IconButton(onPressed: _openNewJob, icon: const Icon(Icons.add)),
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
                      if (_jobs.isEmpty)
                        const Padding(
                          padding: EdgeInsets.all(12),
                          child: Text('Henüz ilan açmadın.', style: TextStyle(color: AppColors.silver500)),
                        ),
                      ..._jobs.map((job) {
                        final active = job.status == 'ACTIVE';
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
                                      Text(job.title, style: Theme.of(context).textTheme.titleMedium),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${job.city}${job.district != null ? ' / ${job.district}' : ''} · '
                                        '${active ? 'Aktif' : 'Kapalı'}',
                                        style: const TextStyle(color: AppColors.silver500, fontSize: 12),
                                      ),
                                      Text(
                                        listingIntents.labelFor(job.listingType),
                                        style: const TextStyle(color: AppColors.gold400, fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ),
                                if (active)
                                  TextButton(
                                    onPressed: () => _close(job.id),
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