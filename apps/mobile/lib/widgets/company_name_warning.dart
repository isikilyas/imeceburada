import 'dart:async';
import 'package:flutter/material.dart';
import '../core/api_client.dart';

/// Piyasa dizininin parçalanmasını önlemek için sisteme kayıtlı benzer isimli
/// firmalar hakkında bilgilendirme yapar — web'deki CompanyNameWarning ile
/// aynı: asla engellemez, sadece uyarır.
class CompanyNameWarning extends StatefulWidget {
  final String name;

  const CompanyNameWarning({super.key, required this.name});

  @override
  State<CompanyNameWarning> createState() => _CompanyNameWarningState();
}

class _CompanyNameWarningState extends State<CompanyNameWarning> {
  final _api = ApiClient();
  Timer? _debounce;
  List<String> _similarNames = [];

  @override
  void didUpdateWidget(covariant CompanyNameWarning oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.name != widget.name) _check(widget.name);
  }

  @override
  void initState() {
    super.initState();
    _check(widget.name);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  void _check(String name) {
    _debounce?.cancel();
    final trimmed = name.trim();
    if (trimmed.length < 3) {
      setState(() => _similarNames = []);
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 400), () async {
      try {
        final res = await _api.get('/taxonomy/company-name-suggestions', query: {'name': trimmed});
        final list = (res as List).map((s) => (s as Map<String, dynamic>)['name'] as String).toList();
        if (mounted) setState(() => _similarNames = list);
      } catch (_) {
        if (mounted) setState(() => _similarNames = []);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_similarNames.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Text(
        'Sistemde benzer isimli firma(lar) var: ${_similarNames.join(", ")} — aynı firma değilseniz göz ardı edebilirsin.',
        style: const TextStyle(color: Colors.amber, fontSize: 12),
      ),
    );
  }
}
