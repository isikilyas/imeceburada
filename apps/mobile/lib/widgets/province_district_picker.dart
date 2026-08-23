import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants.dart';
import '../core/locale_store.dart';
import 'app_dropdown.dart';

/// İl + ilçe seçimi — web'deki ProvinceDistrictSelect ile aynı davranış:
/// il değişince ilçe sıfırlanır, ilçe listesi seçili ile göre değişir.
class ProvinceDistrictPicker extends StatelessWidget {
  final String city;
  final String district;
  final ValueChanged<String> onCityChanged;
  final ValueChanged<String> onDistrictChanged;
  final bool allowEmptyDistrict;
  final bool allowEmptyCity;

  const ProvinceDistrictPicker({
    super.key,
    required this.city,
    required this.district,
    required this.onCityChanged,
    required this.onDistrictChanged,
    this.allowEmptyDistrict = false,
    this.allowEmptyCity = false,
  });

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    final emptyDistrict = Option('', t('widgets.provinceDistrict.selectDistrict'));
    final allDistricts = Option('', t('widgets.provinceDistrict.allDistricts'));
    final allCities = Option('', t('widgets.provinceDistrict.allCities'));

    final districts = city.isEmpty ? <String>[] : districtsForProvince(city);
    final districtOptions = [
      allowEmptyDistrict ? allDistricts : emptyDistrict,
      ...districts.map((d) => Option(d, d)),
    ];
    final districtValue = districts.contains(district) ? district : '';

    return Column(
      children: [
        AppDropdown(
          label: t('widgets.provinceDistrict.city'),
          value: city,
          options: [
            if (allowEmptyCity) allCities,
            ...turkishProvinces.map((p) => Option(p, p)),
          ],
          onChanged: (v) {
            onCityChanged(v);
            onDistrictChanged('');
          },
        ),
        AppDropdown(
          label: t('widgets.provinceDistrict.district'),
          value: districtValue,
          options: districtOptions,
          onChanged: onDistrictChanged,
        ),
      ],
    );
  }
}