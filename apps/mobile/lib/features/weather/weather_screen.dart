import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../core/constants.dart';
import '../../theme/app_theme.dart';
import '../../widgets/province_district_picker.dart';

const _turkishWeekdays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const _turkishMonths = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

class _DailyForecast {
  final String date;
  final int weatherCode;
  final int tempMin;
  final int tempMax;
  final int windMax;
  final int precipProbability;
  _DailyForecast({
    required this.date,
    required this.weatherCode,
    required this.tempMin,
    required this.tempMax,
    required this.windMax,
    required this.precipProbability,
  });
}

class _HourlyForecast {
  final String time;
  final int temperature;
  final int windSpeed;
  final int precipProbability;
  _HourlyForecast({
    required this.time,
    required this.temperature,
    required this.windSpeed,
    required this.precipProbability,
  });
}

class _RiskFlag {
  final String icon;
  final String label;
  const _RiskFlag(this.icon, this.label);
}

({String icon, String text}) _describeWeatherCode(int code) {
  if (code == 0) return (icon: '☀️', text: 'Açık');
  if (code == 1 || code == 2) return (icon: '🌤️', text: 'Parçalı bulutlu');
  if (code == 3) return (icon: '☁️', text: 'Kapalı');
  if (code == 45 || code == 48) return (icon: '🌫️', text: 'Sisli');
  if (code >= 51 && code <= 57) return (icon: '🌦️', text: 'Çisenti');
  if (code >= 61 && code <= 67) return (icon: '🌧️', text: 'Yağmurlu');
  if (code >= 71 && code <= 77) return (icon: '❄️', text: 'Kar yağışlı');
  if (code >= 80 && code <= 82) return (icon: '🌧️', text: 'Sağanak yağmur');
  if (code >= 85 && code <= 86) return (icon: '🌨️', text: 'Kar sağanağı');
  if (code >= 95) return (icon: '⛈️', text: 'Gök gürültülü fırtına');
  return (icon: '🌡️', text: 'Hava durumu');
}

List<_RiskFlag> _dayRisks(_DailyForecast d) {
  final risks = <_RiskFlag>[];
  if (d.tempMin <= 0) risks.add(const _RiskFlag('❄️', 'Don riski'));
  if (d.tempMax >= 33) risks.add(const _RiskFlag('🔥', 'Aşırı sıcak'));
  if (d.windMax >= 40) risks.add(const _RiskFlag('💨', 'Kuvvetli rüzgar'));
  if (d.precipProbability >= 70) risks.add(const _RiskFlag('🌧️', 'Yoğun yağış riski'));
  return risks;
}

_RiskFlag? _hourRisk(_HourlyForecast h) {
  if (h.temperature <= 0) return const _RiskFlag('❄️', 'Don');
  if (h.temperature >= 33) return const _RiskFlag('🔥', 'Aşırı sıcak');
  if (h.windSpeed >= 40) return const _RiskFlag('💨', 'Kuvvetli rüzgar');
  if (h.precipProbability >= 70) return const _RiskFlag('🌧️', 'Yoğun yağış');
  return null;
}

class WeatherScreen extends StatefulWidget {
  const WeatherScreen({super.key});

  @override
  State<WeatherScreen> createState() => _WeatherScreenState();
}

class _WeatherScreenState extends State<WeatherScreen> {
  String _city = turkishProvinces.first;
  String _district = '';
  int _rangeDays = 7;

  bool _isLoading = true;
  String? _error;
  List<_DailyForecast> _daily = [];
  List<_HourlyForecast> _hourly = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final query = _district.isNotEmpty ? '$_district, $_city' : _city;
      final geoUri = Uri.parse(
        'https://geocoding-api.open-meteo.com/v1/search?name=${Uri.encodeComponent(query)}&count=5&language=tr&format=json&country=TR',
      );
      final geoRes = await http.get(geoUri);
      final geoData = jsonDecode(geoRes.body) as Map<String, dynamic>;
      final results = (geoData['results'] as List?) ?? [];
      if (results.isEmpty) {
        setState(() {
          _error = 'Bu bölge için hava durumu verisi bulunamadı.';
          _isLoading = false;
        });
        return;
      }
      final match = results.firstWhere(
        (r) => r['admin1'] == _city,
        orElse: () => results.first,
      ) as Map<String, dynamic>;
      final lat = match['latitude'];
      final lon = match['longitude'];

      final forecastUri = Uri.parse(
        'https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max&hourly=temperature_2m,weather_code,wind_speed_10m,precipitation_probability&forecast_days=$_rangeDays&timezone=auto',
      );
      final forecastRes = await http.get(forecastUri);
      final data = jsonDecode(forecastRes.body) as Map<String, dynamic>;
      final dailyJson = data['daily'] as Map<String, dynamic>;
      final hourlyJson = data['hourly'] as Map<String, dynamic>;

      final dailyTimes = dailyJson['time'] as List;
      final daily = List.generate(dailyTimes.length, (i) {
        return _DailyForecast(
          date: dailyTimes[i] as String,
          weatherCode: (dailyJson['weather_code'][i] as num).toInt(),
          tempMin: (dailyJson['temperature_2m_min'][i] as num).round(),
          tempMax: (dailyJson['temperature_2m_max'][i] as num).round(),
          windMax: (dailyJson['wind_speed_10m_max'][i] as num).round(),
          precipProbability: ((dailyJson['precipitation_probability_max'][i] as num?) ?? 0).round(),
        );
      });

      final hourlyTimes = hourlyJson['time'] as List;
      final hourly = List.generate(hourlyTimes.length, (i) {
        return _HourlyForecast(
          time: hourlyTimes[i] as String,
          temperature: (hourlyJson['temperature_2m'][i] as num).round(),
          windSpeed: (hourlyJson['wind_speed_10m'][i] as num).round(),
          precipProbability: ((hourlyJson['precipitation_probability'][i] as num?) ?? 0).round(),
        );
      });

      setState(() {
        _daily = daily;
        _hourly = hourly;
      });
    } catch (_) {
      setState(() => _error = 'Hava durumu verisi alınamadı.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _formatDayLabel(String dateStr) {
    final date = DateTime.parse(dateStr);
    final weekday = _turkishWeekdays[date.weekday - 1];
    final month = _turkishMonths[date.month - 1];
    return '$weekday, ${date.day} $month';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Şantiye Hava Durumu')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ProvinceDistrictPicker(
            city: _city,
            district: _district,
            allowEmptyDistrict: true,
            onCityChanged: (v) {
              setState(() {
                _city = v;
                _district = '';
              });
              _load();
            },
            onDistrictChanged: (v) {
              setState(() => _district = v);
              _load();
            },
          ),
          Row(
            children: [
              Expanded(
                child: _RangeButton(
                  label: 'Haftalık (7 gün)',
                  selected: _rangeDays == 7,
                  onTap: () {
                    setState(() => _rangeDays = 7);
                    _load();
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _RangeButton(
                  label: '16 Günlük',
                  selected: _rangeDays == 16,
                  onTap: () {
                    setState(() => _rangeDays = 16);
                    _load();
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Not: Güvenilir hava tahmini en fazla ~16 gün ileriye kadar yapılabilir, tam aylık (30 günlük) '
            'tahmin sunmuyoruz.',
            style: TextStyle(color: AppColors.silver500, fontSize: 12),
          ),
          const SizedBox(height: 12),
          if (_isLoading) const Center(child: CircularProgressIndicator(color: AppColors.gold500)),
          if (!_isLoading && _error != null)
            Text(_error!, style: const TextStyle(color: AppColors.red400)),
          if (!_isLoading && _error == null)
            ..._daily.map((d) {
              final desc = _describeWeatherCode(d.weatherCode);
              final risks = _dayRisks(d);
              final dayHours = _hourly.where((h) => h.time.startsWith(d.date)).toList();
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: ExpansionTile(
                  title: Text('${desc.icon} ${_formatDayLabel(d.date)}',
                      style: Theme.of(context).textTheme.titleMedium),
                  subtitle: Text(
                    '${desc.text} · ${d.tempMin}° / ${d.tempMax}°C · 💨 ${d.windMax} km/s',
                    style: const TextStyle(color: AppColors.silver500),
                  ),
                  trailing: risks.isNotEmpty
                      ? Text(risks.map((r) => r.icon).join(), style: const TextStyle(fontSize: 16))
                      : null,
                  children: [
                    if (risks.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                        child: Wrap(
                          spacing: 8,
                          children: risks
                              .map((r) => Chip(
                                    label: Text('${r.icon} ${r.label}', style: const TextStyle(fontSize: 11)),
                                    backgroundColor: AppColors.ink800,
                                  ))
                              .toList(),
                        ),
                      ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
                      child: Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: dayHours.map((h) {
                          final risk = _hourRisk(h);
                          return Container(
                            width: 90,
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              border: Border.all(color: risk != null ? AppColors.gold500 : AppColors.ink800),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(h.time.substring(11, 16),
                                    style: const TextStyle(color: AppColors.silver300, fontSize: 12)),
                                Text('${h.temperature}°C · 💨${h.windSpeed}',
                                    style: const TextStyle(color: AppColors.silver500, fontSize: 11)),
                                if (risk != null)
                                  Text('${risk.icon} ${risk.label}',
                                      style: const TextStyle(color: AppColors.gold400, fontSize: 10)),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }
}

class _RangeButton extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _RangeButton({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.gold500 : AppColors.ink900,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: selected ? AppColors.gold500 : AppColors.ink700),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: selected ? AppColors.ink950 : AppColors.silver400,
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
        ),
      ),
    );
  }
}