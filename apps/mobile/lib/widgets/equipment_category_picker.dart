import 'package:flutter/material.dart';
import '../core/constants.dart';
import 'app_dropdown.dart';

EquipmentCategory? _categoryOf(String itemValue) {
  for (final category in equipmentCategories) {
    if (category.items.any((i) => i.value == itemValue)) return category;
  }
  return null;
}

/// Kategori → Ekipman kademeli seçimi — web'deki EquipmentCategorySelect ile aynı.
class EquipmentCategoryPicker extends StatefulWidget {
  final String value;
  final ValueChanged<String> onChanged;

  const EquipmentCategoryPicker({super.key, required this.value, required this.onChanged});

  @override
  State<EquipmentCategoryPicker> createState() => _EquipmentCategoryPickerState();
}

class _EquipmentCategoryPickerState extends State<EquipmentCategoryPicker> {
  late String _categoryLabel = _categoryOf(widget.value)?.label ?? equipmentCategories.first.label;

  @override
  void didUpdateWidget(covariant EquipmentCategoryPicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != widget.value) {
      final category = _categoryOf(widget.value);
      if (category != null) setState(() => _categoryLabel = category.label);
    }
  }

  EquipmentCategory get _category =>
      equipmentCategories.firstWhere((c) => c.label == _categoryLabel, orElse: () => equipmentCategories.first);

  @override
  Widget build(BuildContext context) {
    final category = _category;

    return Column(
      children: [
        AppDropdown(
          label: 'Ekipman Kategorisi',
          value: category.label,
          options: equipmentCategories.map((c) => Option(c.label, '${c.icon} ${c.label}')).toList(),
          onChanged: (v) {
            final nextCategory = equipmentCategories.firstWhere((c) => c.label == v);
            setState(() => _categoryLabel = v);
            widget.onChanged(nextCategory.items.first.value);
          },
        ),
        AppDropdown(
          label: 'Ekipman',
          value: category.items.any((i) => i.value == widget.value) ? widget.value : category.items.first.value,
          options: category.items,
          onChanged: widget.onChanged,
        ),
      ],
    );
  }
}