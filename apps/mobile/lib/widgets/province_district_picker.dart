import 'package:flutter/material.dart';
import '../core/constants.dart';
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

  static const _emptyDistrict = Option('', 'İlçe seç');
  static const _allDistricts = Option('', 'Tüm İlçeler');
  static const _allCities = Option('', 'Tüm Şehirler');

  @override
  Widget build(BuildContext context) {
    final districts = city.isEmpty ? <String>[] : districtsForProvince(city);
    final districtOptions = [
      allowEmptyDistrict ? _allDistricts : _emptyDistrict,
      ...districts.map((d) => Option(d, d)),
    ];
    final districtValue = districts.contains(district) ? district : '';

    return Column(
      children: [
        AppDropdown(
          label: 'Şehir',
          value: city,
          options: [
            if (allowEmptyCity) _allCities,
            ...turkishProvinces.map((p) => Option(p, p)),
          ],
          onChanged: (v) {
            onCityChanged(v);
            onDistrictChanged('');
          },
        ),
        AppDropdown(
          label: 'İlçe',
          value: districtValue,
          options: districtOptions,
          onChanged: onDistrictChanged,
        ),
      ],
    );
  }
}