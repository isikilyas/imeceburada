import 'package:intl/intl.dart';
import 'package:flutter/material.dart';
import '../../core/api_client.dart';
import '../../core/constants.dart';
import '../../models/index_point.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_dropdown.dart';
import '../material_listings/material_listings_screen.dart';
import '../weather/weather_screen.dart';
import '../../widgets/supplier_spotlight.dart';
import 'submit_price_screen.dart';

enum _IndexMode { labor, material }

class MarketIndexScreen extends StatefulWidget {
  const MarketIndexScreen({super.key});

  @override
  State<MarketIndexScreen> createState() => _MarketIndexScreenState();
}

class _MarketIndexScreenState extends State<MarketIndexScreen> {
  final _api = ApiClient();
  final _numberFormat = NumberFormat.decimalPattern('tr_TR');

  _IndexMode _mode = _IndexMode.labor;
  String _category = tradeCategories.first.value;
  String _city = turkishProvinces.first;

  bool _isLoading = true;
  String? _error;
  List<IndexPoint> _points = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  List<Option> get _categoryOptions => _mode == _IndexMode.labor ? tradeCategories : materialTypes;

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final path = _mode == _IndexMode.labor ? '/wage-index' : '/material-index';
      final categoryKey = _mode == _IndexMode.labor ? 'tradeCategory' : 'materialType';
      final raw = await _api.get(path, query: {categoryKey: _category, 'city': _city});
      final list = (raw as List)
          .map((e) => _mode == _IndexMode.labor
              ? IndexPoint.fromWageJson(e as Map<String, dynamic>)
              : IndexPoint.fromMaterialJson(e as Map<String, dynamic>))
          .toList();
      setState(() => _points = list);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Bağlantı hatası, tekrar deneyin');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _onModeChanged(_IndexMode mode) {
    setState(() {
      _mode = mode;
      _category = _categoryOptions.first.value;
    });
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Canlı Piyasa Endeksi'),
        actions: [
          IconButton(
            tooltip: 'Şantiye Hava Durumu',
            icon: const Icon(Icons.wb_sunny_outlined),
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const WeatherScreen()),
            ),
          ),
          IconButton(
            tooltip: 'Malzeme İlanları',
            icon: const Icon(Icons.storefront_outlined),
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const MaterialListingsScreen()),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final shared = await Navigator.of(context).push<bool>(
            MaterialPageRoute(builder: (_) => SubmitPriceScreen(isLabor: _mode == _IndexMode.labor)),
          );
          if (shared == true) _load();
        },
        backgroundColor: AppColors.gold500,
        foregroundColor: AppColors.ink950,
        icon: const Icon(Icons.add),
        label: const Text('Bilgi Paylaş'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const SupplierSpotlight(),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _ModeButton(
                  label: 'İşçilik',
                  selected: _mode == _IndexMode.labor,
                  onTap: () => _onModeChanged(_IndexMode.labor),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _ModeButton(
                  label: 'Malzeme',
                  selected: _mode == _IndexMode.material,
                  onTap: () => _onModeChanged(_IndexMode.material),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          AppDropdown(
            label: _mode == _IndexMode.labor ? 'Meslek' : 'Malzeme',
            value: _category,
            options: _categoryOptions,
            onChanged: (v) {
              setState(() => _category = v);
              _load();
            },
          ),
          AppDropdown(
            label: 'Şehir',
            value: _city,
            options: turkishProvinces.map((p) => Option(p, p)).toList(),
            onChanged: (v) {
              setState(() => _city = v);
              _load();
            },
          ),
          const SizedBox(height: 8),
          if (_isLoading) const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator(color: AppColors.gold500))),
          if (!_isLoading && _error != null)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Text(_error!, style: const TextStyle(color: AppColors.red400)),
            ),
          if (!_isLoading && _error == null && _points.isEmpty)
            const Padding(
              padding: EdgeInsets.all(12),
              child: Text(
                'Bu filtre için yeterli veri yok (en az 3 veri girişi gerekir).',
                style: TextStyle(color: AppColors.silver500),
              ),
            ),
          ..._points.map((p) => _IndexCard(point: p, numberFormat: _numberFormat)),
        ],
      ),
    );
  }
}

class _ModeButton extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _ModeButton({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.gold500 : AppColors.ink900,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
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
            ),
          ),
        ),
      ),
    );
  }
}

class _IndexCard extends StatelessWidget {
  final IndexPoint point;
  final NumberFormat numberFormat;

  const _IndexCard({required this.point, required this.numberFormat});

  @override
  Widget build(BuildContext context) {
    final unitSuffix = point.unit != null ? '₺/${point.unit}' : '₺';
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(point.month, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 4),
            Text(
              'Ortalama: ${numberFormat.format(point.averageAmount)} $unitSuffix · Medyan: ${numberFormat.format(point.medianAmount)} $unitSuffix',
              style: const TextStyle(color: AppColors.silver400, fontSize: 13),
            ),
            const SizedBox(height: 2),
            Text('Örneklem: ${point.sampleSize}', style: const TextStyle(color: AppColors.silver500, fontSize: 12)),
            if (point.expectationAverage != null) ...[
              const SizedBox(height: 4),
              Text(
                'Piyasa beklentisi (teklif ortalaması): ${numberFormat.format(point.expectationAverage)} $unitSuffix',
                style: const TextStyle(color: AppColors.green400, fontSize: 12),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
