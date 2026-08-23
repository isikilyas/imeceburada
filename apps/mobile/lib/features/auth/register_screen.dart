import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/material_category_picker.dart';
import '../../widgets/province_district_picker.dart';
import '../../widgets/trade_category_picker.dart';

enum _Role { candidate, company, supplier, subcontractor }

const _roleLabelKeys = {
  _Role.candidate: 'auth.roleCandidate',
  _Role.company: 'auth.roleCompany',
  _Role.supplier: 'auth.roleSupplier',
  _Role.subcontractor: 'auth.roleSubcontractor',
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
      setState(() => _error = context.read<LocaleStore>().t('auth.subcontractorCategoryRequired'));
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
      setState(() => _error = context.read<LocaleStore>().t('auth.registerFailedGeneric'));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return Scaffold(
      appBar: AppBar(title: Text(t('auth.registerTitle'))),
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
                      label: t(_roleLabelKeys[role]!),
                      selected: _role == role,
                      onTap: () => setState(() => _role = role),
                    ))
                .toList(),
          ),
          if (_role == _Role.supplier) ...[
            const SizedBox(height: 8),
            Text(
              t('auth.supplierInfoText'),
              style: const TextStyle(color: AppColors.silver500, fontSize: 12),
            ),
          ],
          if (_role == _Role.subcontractor) ...[
            const SizedBox(height: 8),
            Text(
              t('auth.subcontractorInfoText'),
              style: const TextStyle(color: AppColors.silver500, fontSize: 12),
            ),
          ],
          const SizedBox(height: 16),
          TextField(
            controller: _nameController,
            decoration: InputDecoration(
              labelText: _role == _Role.candidate ? t('auth.fullNameLabel') : t('auth.companyNameLabel'),
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
              decoration: InputDecoration(labelText: t('auth.descriptionOptionalLabel')),
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
            decoration: InputDecoration(labelText: t('auth.emailLabel')),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _passwordController,
            obscureText: true,
            decoration: InputDecoration(labelText: t('auth.passwordMinLabel')),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: AppColors.red400)),
          ],
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submit,
            child: Text(_isSubmitting ? t('auth.registerSubmitting') : t('auth.registerButton')),
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