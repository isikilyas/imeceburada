import 'package:flutter/material.dart';
import '../core/constants.dart';
import '../theme/app_theme.dart';

class AppDropdown extends StatelessWidget {
  final String label;
  final String value;
  final List<Option> options;
  final ValueChanged<String> onChanged;

  const AppDropdown({
    super.key,
    required this.label,
    required this.value,
    required this.options,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppColors.silver500, fontSize: 13)),
          const SizedBox(height: 4),
          Container(
            decoration: BoxDecoration(
              color: AppColors.ink900,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.ink700),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: value,
                isExpanded: true,
                dropdownColor: AppColors.ink900,
                icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.silver500),
                style: const TextStyle(color: AppColors.silver300),
                items: options
                    .map((o) => DropdownMenuItem(value: o.value, child: Text(o.label)))
                    .toList(),
                onChanged: (v) {
                  if (v != null) onChanged(v);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
