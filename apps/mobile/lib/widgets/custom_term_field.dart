import 'dart:async';
import 'package:flutter/material.dart';
import '../core/api_client.dart';
import '../theme/app_theme.dart';

class TaxonomySuggestion {
  final String value;
  final String label;
  const TaxonomySuggestion(this.value, this.label);
}

/// Kapalı listede olmayan meslek/malzeme/ekipman terimleri için serbest metin
/// girişi + "bunu mu demek istediniz?" önerisi — web'deki CustomTermInput ile
/// aynı: asla engellemez, kullanıcı öneriyi seçebilir ya da kendi yazdığıyla
/// ısrar edebilir; ikisi de eklenir, sunucu eşleşmeyeni onay kuyruğuna alır.
class CustomTermField extends StatefulWidget {
  /// "TRADE_PROFESSION" | "MATERIAL_TYPE" | "MATERIAL_CATEGORY_ITEM" | "EQUIPMENT_TYPE"
  final String taxonomyType;
  final ValueChanged<String> onAdd;
  final String? hintText;

  const CustomTermField({super.key, required this.taxonomyType, required this.onAdd, this.hintText});

  @override
  State<CustomTermField> createState() => _CustomTermFieldState();
}

class _CustomTermFieldState extends State<CustomTermField> {
  final _api = ApiClient();
  final _controller = TextEditingController();
  Timer? _debounce;
  bool _isLoading = false;
  bool _exactMatch = false;
  List<TaxonomySuggestion> _suggestions = [];

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _onChanged(String query) {
    _debounce?.cancel();
    final trimmed = query.trim();
    if (trimmed.length < 2) {
      setState(() {
        _suggestions = [];
        _exactMatch = false;
      });
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 300), () async {
      setState(() => _isLoading = true);
      try {
        final res = await _api.get('/taxonomy/suggest', query: {'type': widget.taxonomyType, 'q': trimmed});
        final map = res as Map<String, dynamic>;
        final list = (map['suggestions'] as List)
            .map((s) => TaxonomySuggestion(s['value'] as String, s['label'] as String))
            .toList();
        if (mounted) {
          setState(() {
            _suggestions = list;
            _exactMatch = map['exactMatch'] as bool? ?? false;
          });
        }
      } catch (_) {
        if (mounted) setState(() => _suggestions = []);
      } finally {
        if (mounted) setState(() => _isLoading = false);
      }
    });
  }

  void _commit(String value) {
    widget.onAdd(value);
    _controller.clear();
    setState(() {
      _suggestions = [];
      _exactMatch = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final hasSuggestions = !_isLoading && !_exactMatch && _suggestions.isNotEmpty;
    final isNewTerm = !_isLoading && !_exactMatch && _controller.text.trim().length >= 2;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: _controller,
          onChanged: _onChanged,
          decoration: InputDecoration(hintText: widget.hintText ?? 'Listede yoksa kendi terimini yaz'),
        ),
        if (_isLoading)
          const Padding(
            padding: EdgeInsets.only(top: 4),
            child: Text('Kontrol ediliyor...', style: TextStyle(color: AppColors.silver500, fontSize: 12)),
          ),
        if (hasSuggestions)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.ink700),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Bunu mu demek istediniz?', style: TextStyle(color: AppColors.silver500, fontSize: 12)),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: _suggestions
                        .map((s) => ActionChip(
                              label: Text(s.label, style: const TextStyle(color: AppColors.gold400, fontSize: 12)),
                              backgroundColor: AppColors.ink800,
                              onPressed: () => _commit(s.value),
                            ))
                        .toList(),
                  ),
                ],
              ),
            ),
          ),
        const SizedBox(height: 8),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: _controller.text.trim().isEmpty ? null : () => _commit(_controller.text.trim()),
            child: Text(hasSuggestions ? '"${_controller.text.trim()}" ile devam et' : 'Bu terimi ekle'),
          ),
        ),
        if (isNewTerm)
          const Padding(
            padding: EdgeInsets.only(top: 6),
            child: Text(
              'Bu terim listede yok — eklersen ilanın hemen yayınlanır, terim ayrıca onay için gönderilir.',
              style: TextStyle(color: AppColors.silver500, fontSize: 12),
            ),
          ),
      ],
    );
  }
}
