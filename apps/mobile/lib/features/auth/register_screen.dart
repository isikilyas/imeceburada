import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../theme/app_theme.dart';
import '../../widgets/material_category_picker.dart';
import '../../widgets/province_district_picker.dart';
import '../../widgets/trade_category_picker.dart';

enum _Role { candidate, company, supplier, subcontractor }

const _roleLabels = {
  _Role.candidate: 'İş Arayan Personel',
  _Role.company: 'Firma',
  _Role.supplier: 'Yapı Tedarik',
  _Role.subcontractor: 'Taşeron Firma',
};

class _RegisterScreenState extends State<RegisterScreen> {
  _Role _role = _Role.candidate;
  String _city = turkishProvinces.first;
  String _district = '';
  List<String> _supplyCategories = [];
  List<String> _subcontractorTradeCategories = [tradeFields.first.branches.first.professions.first.value];

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController(); // ad soyad ya da şirket/firma adı
  final _descriptionController = TextEditingController();

  bool _isSubmitting = false;
  String? _error;

  Future<void> _submit() async {
    if (_role == _Role.subcontractor && _subcontractorTradeCategories.isEmpty) {
      setState(() => _error = 'En az bir branş/meslek seçmelisin');
      return;
    }
    setState(() {
      _isSubmitting = true;
      _error = null;
    });
    try {
      final auth = context.read<AuthStore>();
      switch (_role) {
        case _Role.candidate:
          await auth.registerCandidate(
            email: _emailController.text.trim(),
            password: _passwordController.text,
            fullName: _nameController.text.trim(),
            city: _city,
            district: _district,
          );
          break;
        case _Role.company:
          await auth.registerCompany(
            email: _emailController.text.trim(),
            password: _passwordController.text,
            companyName: _nameController.text.trim(),
            city: _city,
            district: _district,
          );
          break;
        case _Role.supplier:
          await auth.registerSupplier(
            email: _emailController.text.trim(),
            password: _passwordController.text,
            companyName: _nameController.text.trim(),
            city: _city,
            district: _district,
            supplyCategories: _supplyCategories,
          );
          break;
        case _Role.subcontractor:
          await auth.registerSubcontractor(
            email: _emailController.text.trim(),
            password: _passwordController.text,
            companyName: _nameController.text.trim(),
            city: _city,
            district: _district,
            tradeCategories: _subcontractorTradeCategories,
            description: _descriptionController.text.trim(),
          );
          break;
      }
      if (mounted) Navigator.of(context).popUntil((route) => route.isFirst);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Kayıt oluşturulamadı');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Kayıt Ol')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            childAspectRatio: 2.6,
            children: _Role.values
                .map((role) => _RoleButton(
                      label: _roleLabels[role]!,
                      selected: _role == role,
                      onTap: () => setState(() => _role = role),
                    ))
                .toList(),
          ),
          if (_role == _Role.supplier) ...[
            const SizedBox(height: 8),
            const Text(
              'Yapı Tedarik üyeliği sadece inşaat malzemesi ilanı vermek içindir — iş ilanı '
              'açamazsın. Tedarik ettiğin ürün/hizmet gruplarını seçmen isteğe bağlı.',
              style: TextStyle(color: AppColors.silver500, fontSize: 12),
            ),
          ],
          if (_role == _Role.subcontractor) ...[
            const SizedBox(height: 8),
            const Text(
              'Taşeron Firma üyeliği, hangi branşta taşeronluk yaptığını diğer firmaların '
              'bulabileceği şekilde ilan eder.',
              style: TextStyle(color: AppColors.silver500, fontSize: 12),
            ),
          ],
          const SizedBox(height: 16),
          TextField(
            controller: _nameController,
            decoration: InputDecoration(
              labelText: _role == _Role.candidate ? 'Ad Soyad' : 'Firma Adı',
            ),
          ),
          const SizedBox(height: 12),
          if (_role == _Role.supplier)
            MaterialCategoryMultiPicker(
              values: _supplyCategories,
              onChanged: (v) => setState(() => _supplyCategories = v),
            ),
          if (_role == _Role.subcontractor) ...[
            TradeCategoryMultiPicker(
              values: _subcontractorTradeCategories,
              onChanged: (v) => setState(() => _subcontractorTradeCategories = v),
            ),
            TextField(
              controller: _descriptionController,
              maxLines: 2,
              decoration: const InputDecoration(labelText: 'Açıklama (opsiyonel)'),
            ),
            const SizedBox(height: 12),
          ],
          ProvinceDistrictPicker(
            city: _city,
            district: _district,
            onCityChanged: (v) => setState(() => _city = v),
            onDistrictChanged: (v) => setState(() => _district = v),
          ),
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(labelText: 'E-posta'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _passwordController,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Şifre (en az 8 karakter)'),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: AppColors.red400)),
          ],
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submit,
            child: Text(_isSubmitting ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'),
          ),
        ],
      ),
    );
  }
}

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RoleButton extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _RoleButton({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.gold500 : AppColors.ink900,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: selected ? AppColors.gold500 : AppColors.ink700),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: selected ? AppColors.ink950 : AppColors.silver400,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ),
      ),
    );
  }
}