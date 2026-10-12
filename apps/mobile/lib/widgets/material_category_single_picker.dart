import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants.dart';
import '../core/locale_store.dart';
import '../theme/app_theme.dart';
import 'app_dropdown.dart';
import 'custom_term_field.dart';

MaterialCategory? _categoryOf(String itemValue) {
  for (final category in materialCategories) {
    if (category.items.any((i) => i.value == itemValue)) return category;
  }
  return null;
}

/// Kategori → Malzeme kademeli TEKİL seçimi — EquipmentCategoryPicker ile
/// aynı desen (MaterialCategoryMultiPicker'dan farklı olarak tek değer döner,
/// Şantiye Radarı'nda "Malzeme" çağrısı için kullanılır).
class MaterialCategorySinglePicker extends StatefulWidget {
  final String value;
  final ValueChanged<String> onChanged;

  const MaterialCategorySinglePicker({super.key, required this.value, required this.onChanged});

  @override
  State<MaterialCategorySinglePicker> createState() => _MaterialCategorySinglePickerState();
}

class _MaterialCategorySinglePickerState extends State<MaterialCategorySinglePicker> {
  late String _categoryLabel = _categoryOf(widget.value)?.label ?? materialCategories.first.label;
  bool _showCustom = false;

  @override
  void didUpdateWidget(covariant MaterialCategorySinglePicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != widget.value) {
      final category = _categoryOf(widget.value);
      if (category != null) setState(() => _categoryLabel = category.label);
    }
  }

  MaterialCategory get _category =>
      materialCategories.firstWhere((c) => c.label == _categoryLabel, orElse: () => materialCategories.first);

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    final category = _category;

    return Column(
      children: [
        AppDropdown(
          label: t('widgets.materialCategory.categoryLabel'),
          value: category.label,
          options: materialCategories.map((c) => Option(c.label, '${c.icon} ${c.label}')).toList(),
          onChanged: (v) {
            final nextCategory = materialCategories.firstWhere((c) => c.label == v);
            setState(() => _categoryLabel = v);
            widget.onChanged(nextCategory.items.first.value);
          },
        ),
        AppDropdown(
          label: t('widgets.materialCategory.itemLabel'),
          value: category.items.any((i) => i.value == widget.value) ? widget.value : category.items.first.value,
          options: category.items,
          onChanged: widget.onChanged,
        ),
        Align(
          alignment: Alignment.centerLeft,
          child: TextButton(
            onPressed: () => setState(() => _showCustom = !_showCustom),
            child: Text(
              _showCustom ? 'Listeden seç' : 'Listede yok mu? Kendi terimini yaz',
              style: const TextStyle(color: AppColors.silver500, fontSize: 12),
            ),
          ),
        ),
        if (_showCustom)
          CustomTermField(
            taxonomyType: 'MATERIAL_CATEGORY_ITEM',
            onAdd: (v) {
              widget.onChanged(v);
              setState(() => _showCustom = false);
            },
          ),
      ],
    );
  }
}
