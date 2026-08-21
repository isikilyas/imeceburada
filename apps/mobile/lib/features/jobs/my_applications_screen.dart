import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/auth_store.dart';
import '../../models/application.dart';
import '../../theme/app_theme.dart';
import 'job_detail_screen.dart';

class MyApplicationsScreen extends StatefulWidget {
  const MyApplicationsScreen({super.key});

  @override
  State<MyApplicationsScreen> createState() => _MyApplicationsScreenState();
}

class _MyApplicationsScreenState extends State<MyApplicationsScreen> {
  bool _isLoading = true;
  String? _error;
  List<JobApplication> _applications = [];

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
      final raw = await context.read<AuthStore>().authorizedGet('/applications/mine');
      final items = (raw as List).map((e) => JobApplication.fromJson(e as Map<String, dynamic>)).toList();
      setState(() => _applications = items);
    } catch (_) {
      setState(() => _error = 'Başvurular yüklenemedi');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Başvurularım')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold500))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: AppColors.red400)))
              : _applications.isEmpty
                  ? const Center(child: Text('Henüz başvurun yok.', style: TextStyle(color: AppColors.silver500)))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _applications.length,
                      itemBuilder: (context, i) {
                        final app = _applications[i];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          child: ListTile(
                            title: Text(app.jobTitle, style: Theme.of(context).textTheme.titleMedium),
                            subtitle: Text(
                              applicationStatusLabels[app.status] ?? app.status,
                              style: const TextStyle(color: AppColors.silver500),
                            ),
                            onTap: () => Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => JobDetailScreen(id: app.jobId)),
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}