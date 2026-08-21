import 'package:flutter/material.dart';
import '../core/constants.dart';
import '../theme/app_theme.dart';
import 'app_dropdown.dart';

TradeField? _fieldOf(String professionValue) {
  for (final field in tradeFields) {
    for (final branch in field.branches) {
      if (branch.professions.any((p) => p.value == professionValue)) return field;
    }
  }
  return null;
}

TradeBranch? _branchOf(String professionValue) {
  for (final field in tradeFields) {
    for (final branch in field.branches) {
      if (branch.professions.any((p) => p.value == professionValue)) return branch;
    }
  }
  return null;
}

/// Alan → Branş → Meslek kademeli seçimi — web'deki TradeCategorySelect ile aynı.
class TradeCategoryPicker extends StatefulWidget {
  final String value;
  final ValueChanged<String> onChanged;

  const TradeCategoryPicker({super.key, required this.value, required this.onChanged});

  @override
  State<TradeCategoryPicker> createState() => _TradeCategoryPickerState();
}

class _TradeCategoryPickerState extends State<TradeCategoryPicker> {
  late String _fieldLabel;
  late String _branchLabel;

  @override
  void initState() {
    super.initState();
    _fieldLabel = _fieldOf(widget.value)?.label ?? tradeFields.first.label;
    _branchLabel = _branchOf(widget.value)?.label ?? tradeFields.first.branches.first.label;
  }

  @override
  void didUpdateWidget(covariant TradeCategoryPicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != widget.value) {
      final field = _fieldOf(widget.value);
      final branch = _branchOf(widget.value);
      if (field != null && branch != null) {
        setState(() {
          _fieldLabel = field.label;
          _branchLabel = branch.label;
        });
      }
    }
  }

  TradeField get _field => tradeFields.firstWhere((f) => f.label == _fieldLabel, orElse: () => tradeFields.first);

  @override
  Widget build(BuildContext context) {
    final field = _field;
    final branch = field.branches.firstWhere(
      (b) => b.label == _branchLabel,
      orElse: () => field.branches.first,
    );

    return Column(
      children: [
        AppDropdown(
          label: 'Çalışma Alanı',
          value: field.label,
          options: tradeFields.map((f) => Option(f.label, '${f.icon} ${f.label}')).toList(),
          onChanged: (v) {
            final nextField = tradeFields.firstWhere((f) => f.label == v);
            final nextBranch = nextField.branches.first;
            setState(() {
              _fieldLabel = v;
              _branchLabel = nextBranch.label;
            });
            widget.onChanged(nextBranch.professions.first.value);
          },
        ),
        AppDropdown(
          label: 'Branş',
          value: branch.label,
          options: field.branches.map((b) => Option(b.label, b.label)).toList(),
          onChanged: (v) {
            final nextBranch = field.branches.firstWhere((b) => b.label == v);
            setState(() => _branchLabel = v);
            widget.onChanged(nextBranch.professions.first.value);
          },
        ),
        AppDropdown(
          label: 'Meslek',
          value: branch.professions.any((p) => p.value == widget.value)
              ? widget.value
              : branch.professions.first.value,
          options: branch.professions,
          onChanged: widget.onChanged,
        ),
      ],
    );
  }
}

/// Taşeron firmalar için çoklu branş/meslek seçimi — web'deki
/// TradeCategoryMultiSelect ile aynı: chip listesi + ekle butonu.
class TradeCategoryMultiPicker extends StatefulWidget {
  final List<String> values;
  final ValueChanged<List<String>> onChanged;

  const TradeCategoryMultiPicker({super.key, required this.values, required this.onChanged});

  @override
  State<TradeCategoryMultiPicker> createState() => _TradeCategoryMultiPickerState();
}

class _TradeCategoryMultiPickerState extends State<TradeCategoryMultiPicker> {
  String _pending = tradeFields.first.branches.first.professions.first.value;

  void _add() {
    if (widget.values.contains(_pending)) return;
    widget.onChanged([...widget.values, _pending]);
  }

  void _remove(String value) {
    widget.onChanged(widget.values.where((v) => v != value).toList());
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.values.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: widget.values.map((v) {
                return Chip(
                  label: Text(tradeCategories.labelFor(v)),
                  backgroundColor: AppColors.ink800,
                  labelStyle: const TextStyle(color: AppColors.gold400, fontSize: 12),
                  deleteIcon: const Icon(Icons.close, size: 16, color: AppColors.silver500),
                  onDeleted: () => _remove(v),
                );
              }).toList(),
            ),
          ),
        TradeCategoryPicker(value: _pending, onChanged: (v) => setState(() => _pending = v)),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(onPressed: _add, child: const Text('+ Branş Ekle')),
        ),
        const SizedBox(height: 14),
      ],
    );
  }
}