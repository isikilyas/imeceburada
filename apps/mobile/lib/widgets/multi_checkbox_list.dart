import 'package:flutter/material.dart';
import '../core/constants.dart';
import '../theme/app_theme.dart';

/// Birden fazla seçilebilen onay kutusu listesi — çalışma şekli tercihleri
/// gibi sabit, kısa seçenek gruplarında kullanılır (web'deki checkbox grid ile aynı).
class MultiCheckboxList extends StatelessWidget {
  final String label;
  final List<Option> options;
  final List<String> values;
  final ValueChanged<List<String>> onChanged;

  const MultiCheckboxList({
    super.key,
    required this.label,
    required this.options,
    required this.values,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppColors.silver300, fontSize: 14)),
        const SizedBox(height: 4),
        ...options.map((option) {
          final checked = values.contains(option.value);
          return CheckboxListTile(
            value: checked,
            onChanged: (v) {
              if (v == true) {
                onChanged([...values, option.value]);
              } else {
                onChanged(values.where((x) => x != option.value).toList());
              }
            },
            title: Text(option.label, style: const TextStyle(color: AppColors.silver400, fontSize: 14)),
            controlAffinity: ListTileControlAffinity.leading,
            contentPadding: EdgeInsets.zero,
            dense: true,
            activeColor: AppColors.gold500,
          );
        }),
      ],
    );
  }
}