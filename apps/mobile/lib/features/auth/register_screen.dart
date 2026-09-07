import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/material_category_picker.dart';
import '../../widgets/password_field.dart';
import '../../widgets/province_district_picker.dart';
import '../../widgets/trade_category_picker.dart';

enum _Role { candidate, company, supplier, subcontractor }
enum _Method { email, phone }

const _roleLabelKeys = {
  _Role.candidate: 'auth.roleCandidate',
  _Role.company: 'auth.roleCompany',
  _Role.supplier: 'auth.roleSupplier',
  _Role.subcontractor: 'auth.roleSubcontractor',
};

class _RegisterScreenState extends State<RegisterScreen> {
  _Role _role = _Role.candidate;
  _Method _method = _Method.email;
  String _city = turkishProvinces.first;
  String _district = '';
  List<String> _supplyCategories = [];
  List<String> _subcontractorTradeCategories = [tradeFields.first.branches.first.professions.first.value];

  final _phoneController = TextEditingController();
  final _verifyEmailController = TextEditingController(); // e-posta yöntemi seçildiğinde doğrulanan adres
  final _codeController = TextEditingController();
  final _emailController = TextEditingController(); // telefon yöntemi seçildiğinde formun geri kalanında istenir
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController(); // ad soyad ya da şirket/firma adı
  final _descriptionController = TextEditingController();

  bool _codeSent = false;
  bool _isSendingCode = false;
  bool _isSubmitting = false;
  String? _error;

  void _switchRole(_Role role) {
    setState(() {
      _role = role;
      _error = null;
      _codeSent = false;
      _codeController.clear();
    });
  }

  void _switchMethod(_Method method) {
    setState(() {
      _method = method;
      _error = null;
      _codeSent = false;
      _codeController.clear();
    });
  }

  Future<void> _sendCode() async {
    setState(() {
      _isSendingCode = true;
      _error = null;
    });
    try {
      final auth = context.read<AuthStore>();
      if (_method == _Method.phone) {
        await auth.requestRegistrationPhoneCode(_phoneController.text.trim());
      } else {
        await auth.requestRegistrationEmailCode(_verifyEmailController.text.trim());
      }
      setState(() => _codeSent = true);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = context.read<LocaleStore>().t('auth.sendCodeFailedGeneric'));
    } finally {
      if (mounted) setState(() => _isSendingCode = false);
    }
  }

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
      final finalEmail = _method == _Method.email ? _verifyEmailController.text.trim() : _emailController.text.trim();
      final phone = _method == _Method.phone ? _phoneController.text.trim() : null;
      final phoneCode = _method == _Method.phone ? _codeController.text.trim() : null;
      final emailCode = _method == _Method.email ? _codeController.text.trim() : null;
      switch (_role) {
        case _Role.candidate:
          await auth.registerCandidate(
            email: finalEmail,
            password: _passwordController.text,
            fullName: _nameController.text.trim(),
            city: _city,
            district: _district,
            phone: phone,
            phoneCode: phoneCode,
            emailCode: emailCode,
          );
          break;
        case _Role.company:
          await auth.registerCompany(
            email: finalEmail,
            password: _passwordController.text,
            companyName: _nameController.text.trim(),
            city: _city,
            district: _district,
            phone: phone,
            phoneCode: phoneCode,
            emailCode: emailCode,
          );
          break;
        case _Role.supplier:
          await auth.registerSupplier(
            email: finalEmail,
            password: _passwordController.text,
            companyName: _nameController.text.trim(),
            city: _city,
            district: _district,
            supplyCategories: _supplyCategories,
            phone: phone,
            phoneCode: phoneCode,
            emailCode: emailCode,
          );
          break;
        case _Role.subcontractor:
          await auth.registerSubcontractor(
            email: finalEmail,
            password: _passwordController.text,
            companyName: _nameController.text.trim(),
            city: _city,
            district: _district,
            tradeCategories: _subcontractorTradeCategories,
            description: _descriptionController.text.trim(),
            phone: phone,
            phoneCode: phoneCode,
            emailCode: emailCode,
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
                      onTap: () => _switchRole(role),
                    ))
                .toList(),
          ),
          const SizedBox(height: 16),
          if (!_codeSent) ...[
            Row(
              children: [
                Expanded(
                  child: _MethodButton(
                    label: t('auth.methodEmail'),
                    selected: _method == _Method.email,
                    onTap: () => _switchMethod(_Method.email),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _MethodButton(
                    label: t('auth.methodPhone'),
                    selected: _method == _Method.phone,
                    onTap: () => _switchMethod(_Method.phone),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              _method == _Method.phone ? t('auth.phoneRequiredHint') : t('auth.emailRequiredHint'),
              style: const TextStyle(color: AppColors.silver500, fontSize: 12),
            ),
            const SizedBox(height: 12),
            if (_method == _Method.phone)
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(labelText: t('auth.phoneLabel')),
              )
            else
              TextField(
                controller: _verifyEmailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(labelText: t('auth.emailLabel')),
              ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: const TextStyle(color: AppColors.red400)),
            ],
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isSendingCode ? null : _sendCode,
              child: Text(_isSendingCode ? t('auth.sendingCode') : t('auth.sendCodeButton')),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.ink700),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _method == _Method.phone
                        ? t('auth.phoneCodeSentHint', vars: {'phone': _phoneController.text.trim()})
                        : t('auth.emailCodeSentHint', vars: {'email': _verifyEmailController.text.trim()}),
                    style: const TextStyle(fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _codeController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    decoration: InputDecoration(labelText: t('auth.phoneCodeLabel')),
                  ),
                  TextButton(
                    onPressed: () => setState(() => _codeSent = false),
                    child: Text(
                      _method == _Method.phone ? t('auth.changePhoneLink') : t('auth.changeEmailLink'),
                      style: const TextStyle(fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            if (_role == _Role.supplier) ...[
              Text(
                t('auth.supplierInfoText'),
                style: const TextStyle(color: AppColors.silver500, fontSize: 12),
              ),
              const SizedBox(height: 8),
            ],
            if (_role == _Role.subcontractor) ...[
              Text(
                t('auth.subcontractorInfoText'),
                style: const TextStyle(color: AppColors.silver500, fontSize: 12),
              ),
              const SizedBox(height: 8),
            ],
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
            if (_method == _Method.phone)
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(labelText: t('auth.emailLabel')),
              ),
            const SizedBox(height: 12),
            PasswordField(controller: _passwordController, labelText: t('auth.passwordMinLabel')),
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

class _MethodButton extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _MethodButton({required this.label, required this.selected, required this.onTap});

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
