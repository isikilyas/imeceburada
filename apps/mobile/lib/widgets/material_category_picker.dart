import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants.dart';
import '../core/locale_store.dart';
import '../theme/app_theme.dart';
import 'app_dropdown.dart';

/// Yapı Tedarik firmaları için çoklu ürün/hizmet kategorisi seçimi —
/// web'deki MaterialCategoryMultiSelect ile aynı: kategori+ürün seç, ekle,
/// chip listesi halinde göster.
class MaterialCategoryMultiPicker extends StatefulWidget {
  final List<String> values;
  final ValueChanged<List<String>> onChanged;

  const MaterialCategoryMultiPicker({super.key, required this.values, required this.onChanged});

  @override
  State<MaterialCategoryMultiPicker> createState() => _MaterialCategoryMultiPickerState();
}

class _MaterialCategoryMultiPickerState extends State<MaterialCategoryMultiPicker> {
  late String _categoryLabel = materialCategories.first.label;
  late String _pendingItem = materialCategories.first.items.first.value;

  MaterialCategory get _category =>
      materialCategories.firstWhere((c) => c.label == _categoryLabel, orElse: () => materialCategories.first);

  void _add() {
    if (widget.values.contains(_pendingItem)) return;
    widget.onChanged([...widget.values, _pendingItem]);
  }

  void _remove(String value) {
    widget.onChanged(widget.values.where((v) => v != value).toList());
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    final category = _category;

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
                  label: Text(materialCategoryItems.labelFor(v)),
                  backgroundColor: AppColors.ink800,
                  labelStyle: const TextStyle(color: AppColors.gold400, fontSize: 12),
                  deleteIcon: const Icon(Icons.close, size: 16, color: AppColors.silver500),
                  onDeleted: () => _remove(v),
                );
              }).toList(),
            ),
          ),
        AppDropdown(
          label: t('widgets.materialCategory.categoryLabel'),
          value: category.label,
          options: materialCategories.map((c) => Option(c.label, '${c.icon} ${c.label}')).toList(),
          onChanged: (v) {
            final nextCategory = materialCategories.firstWhere((c) => c.label == v);
            setState(() {
              _categoryLabel = v;
              _pendingItem = nextCategory.items.first.value;
            });
          },
        ),
        AppDropdown(
          label: t('widgets.materialCategory.itemLabel'),
          value: _pendingItem,
          options: category.items,
          onChanged: (v) => setState(() => _pendingItem = v),
        ),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(onPressed: _add, child: Text(t('widgets.materialCategory.addButton'))),
        ),
        const SizedBox(height: 14),
      ],
    );
  }
}