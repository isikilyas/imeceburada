import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
import '../../core/locale_store.dart';
import '../../models/membership.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_dropdown.dart';
import 'checkout_webview_screen.dart';

class MembershipScreen extends StatefulWidget {
  const MembershipScreen({super.key});

  @override
  State<MembershipScreen> createState() => _MembershipScreenState();
}

class _MembershipScreenState extends State<MembershipScreen> {
  bool _isLoading = true;
  String? _error;
  CompanyMembership? _membership;

  // Telefon doğrulama
  final _phoneController = TextEditingController();
  final _codeController = TextEditingController();
  bool _codeSent = false;
  bool _isPhoneSubmitting = false;
  String? _phoneError;

  // Checkout
  String _plan = 'MONTHLY';
  final _identityController = TextEditingController();
  final _billingNameController = TextEditingController();
  final _billingAddressController = TextEditingController();
  String _billingCity = turkishProvinces.first;
  bool _isCheckoutSubmitting = false;
  String? _checkoutError;

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
      final json = await context.read<AuthStore>().authorizedGet('/membership/me');
      setState(() => _membership = CompanyMembership.fromJson(json as Map<String, dynamic>));
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = context.read<LocaleStore>().t('membership.connectionErrorGeneric'));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _sendCode() async {
    setState(() {
      _isPhoneSubmitting = true;
      _phoneError = null;
    });
    try {
      await context
          .read<AuthStore>()
          .authorizedPost('/companies/me/phone/send-code', body: {'phone': _phoneController.text.trim()});
      setState(() => _codeSent = true);
    } on ApiException catch (e) {
      setState(() => _phoneError = e.message);
    } catch (_) {
      setState(() => _phoneError = context.read<LocaleStore>().t('membership.codeSendFailed'));
    } finally {
      if (mounted) setState(() => _isPhoneSubmitting = false);
    }
  }

  Future<void> _verifyCode() async {
    setState(() {
      _isPhoneSubmitting = true;
      _phoneError = null;
    });
    try {
      await context
          .read<AuthStore>()
          .authorizedPost('/companies/me/phone/verify', body: {'code': _codeController.text.trim()});
      await _load();
    } on ApiException catch (e) {
      setState(() => _phoneError = e.message);
    } catch (_) {
      setState(() => _phoneError = context.read<LocaleStore>().t('membership.codeVerifyFailed'));
    } finally {
      if (mounted) setState(() => _isPhoneSubmitting = false);
    }
  }

  Future<void> _startCheckout() async {
    setState(() {
      _isCheckoutSubmitting = true;
      _checkoutError = null;
    });
    try {
      final json = await context.read<AuthStore>().authorizedPost('/membership/checkout', body: {
        'plan': _plan,
        'identityNumber': _identityController.text.trim(),
        'billingContactName': _billingNameController.text.trim(),
        'billingCity': _billingCity,
        'billingAddress': _billingAddressController.text.trim(),
      });
      final result = CheckoutResult.fromJson(json as Map<String, dynamic>);
      if (!mounted) return;
      final success = await Navigator.of(context).push<bool>(
        MaterialPageRoute(builder: (_) => CheckoutWebViewScreen(checkoutFormContent: result.checkoutFormContent)),
      );
      if (success == true) await _load();
    } on ApiException catch (e) {
      setState(() => _checkoutError = e.message);
    } catch (_) {
      setState(() => _checkoutError = context.read<LocaleStore>().t('membership.checkoutStartFailed'));
    } finally {
      if (mounted) setState(() => _isCheckoutSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return Scaffold(
      appBar: AppBar(title: Text(t('membership.title'))),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold500))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: AppColors.red400)))
              : _buildContent(t),
    );
  }

  Widget _buildContent(String Function(String, {Map<String, String>? vars}) t) {
    final membership = _membership;
    if (membership == null) return const SizedBox.shrink();

    if (membership.status == 'ACTIVE') {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(t('membership.activeStatus'), style: const TextStyle(color: AppColors.gold400, fontSize: 18)),
            if (membership.expiresAt != null) ...[
              const SizedBox(height: 8),
              Text(
                t('membership.expiresAt', vars: {
                  'date': DateTime.parse(membership.expiresAt!).toLocal().toString().split(' ').first,
                }),
                style: const TextStyle(color: AppColors.silver500),
              ),
            ],
          ],
        ),
      );
    }

    if (!membership.phoneVerified) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(t('membership.phoneVerificationTitle'), style: const TextStyle(color: AppColors.silver300, fontSize: 18)),
          const SizedBox(height: 8),
          Text(
            t('membership.phoneVerificationPrompt'),
            style: const TextStyle(color: AppColors.silver500, fontSize: 13),
          ),
          const SizedBox(height: 16),
          if (!_codeSent) ...[
            TextField(
              controller: _phoneController,
              decoration: InputDecoration(labelText: t('membership.phoneLabel')),
            ),
            const SizedBox(height: 12),
            if (_phoneError != null) ...[
              Text(_phoneError!, style: const TextStyle(color: AppColors.red400)),
              const SizedBox(height: 8),
            ],
            ElevatedButton(
              onPressed: _isPhoneSubmitting ? null : _sendCode,
              child: Text(_isPhoneSubmitting ? t('membership.sendingCode') : t('membership.sendCodeButton')),
            ),
          ] else ...[
            TextField(
              controller: _codeController,
              maxLength: 6,
              decoration: InputDecoration(labelText: t('membership.verificationCodeLabel')),
            ),
            if (_phoneError != null) ...[
              Text(_phoneError!, style: const TextStyle(color: AppColors.red400)),
              const SizedBox(height: 8),
            ],
            ElevatedButton(
              onPressed: _isPhoneSubmitting ? null : _verifyCode,
              child: Text(_isPhoneSubmitting ? t('membership.verifyingCode') : t('membership.verifyButton')),
            ),
          ],
        ],
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(t('membership.selectPlanTitle'), style: const TextStyle(color: AppColors.silver300, fontSize: 18)),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _PlanCard(
                label: t('membership.monthlyPlanLabel'),
                priceLabel: t('membership.monthlyPriceLabel'),
                selected: _plan == 'MONTHLY',
                onTap: () => setState(() => _plan = 'MONTHLY'),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _PlanCard(
                label: t('membership.yearlyPlanLabel'),
                priceLabel: t('membership.yearlyPriceLabel'),
                selected: _plan == 'YEARLY',
                onTap: () => setState(() => _plan = 'YEARLY'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _identityController,
          decoration: InputDecoration(labelText: t('membership.identityNumberLabel')),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _billingNameController,
          decoration: InputDecoration(labelText: t('membership.billingContactNameLabel')),
        ),
        const SizedBox(height: 12),
        AppDropdown(
          label: t('membership.billingCityLabel'),
          value: _billingCity,
          options: turkishProvinces.map((p) => Option(p, p)).toList(),
          onChanged: (v) => setState(() => _billingCity = v),
        ),
        TextField(
          controller: _billingAddressController,
          decoration: InputDecoration(labelText: t('membership.billingAddressLabel')),
        ),
        if (_checkoutError != null) ...[
          const SizedBox(height: 12),
          Text(_checkoutError!, style: const TextStyle(color: AppColors.red400)),
        ],
        const SizedBox(height: 20),
        ElevatedButton(
          onPressed: _isCheckoutSubmitting ? null : _startCheckout,
          child: Text(_isCheckoutSubmitting ? t('membership.redirecting') : t('membership.proceedToPaymentButton')),
        ),
      ],
    );
  }
}

class _PlanCard extends StatelessWidget {
  final String label;
  final String priceLabel;
  final bool selected;
  final VoidCallback onTap;

  const _PlanCard({required this.label, required this.priceLabel, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: selected ? AppColors.gold500 : AppColors.ink700),
          color: selected ? AppColors.ink800 : AppColors.ink900,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: AppColors.silver300, fontWeight: FontWeight.w600)),
            Text(priceLabel, style: const TextStyle(color: AppColors.gold400, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}