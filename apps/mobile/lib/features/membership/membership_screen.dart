import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/constants.dart';
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
      setState(() => _error = 'Bağlantı hatası, tekrar deneyin');
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
      setState(() => _phoneError = 'Kod gönderilemedi');
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
      setState(() => _phoneError = 'Kod doğrulanamadı');
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
      setState(() => _checkoutError = 'Ödeme başlatılamadı');
    } finally {
      if (mounted) setState(() => _isCheckoutSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Üyelik')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold500))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: AppColors.red400)))
              : _buildContent(),
    );
  }

  Widget _buildContent() {
    final membership = _membership;
    if (membership == null) return const SizedBox.shrink();

    if (membership.status == 'ACTIVE') {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Üyeliğin aktif ✓', style: TextStyle(color: AppColors.gold400, fontSize: 18)),
            if (membership.expiresAt != null) ...[
              const SizedBox(height: 8),
              Text(
                'Bitiş tarihi: ${DateTime.parse(membership.expiresAt!).toLocal().toString().split(' ').first}',
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
          const Text('Telefon Doğrulama', style: TextStyle(color: AppColors.silver300, fontSize: 18)),
          const SizedBox(height: 8),
          const Text(
            'Üyelik için önce telefon numaranı doğrulaman gerekiyor.',
            style: TextStyle(color: AppColors.silver500, fontSize: 13),
          ),
          const SizedBox(height: 16),
          if (!_codeSent) ...[
            TextField(
              controller: _phoneController,
              decoration: const InputDecoration(labelText: 'Telefon (+90...)'),
            ),
            const SizedBox(height: 12),
            if (_phoneError != null) ...[
              Text(_phoneError!, style: const TextStyle(color: AppColors.red400)),
              const SizedBox(height: 8),
            ],
            ElevatedButton(
              onPressed: _isPhoneSubmitting ? null : _sendCode,
              child: Text(_isPhoneSubmitting ? 'Gönderiliyor...' : 'Kod Gönder'),
            ),
          ] else ...[
            TextField(
              controller: _codeController,
              maxLength: 6,
              decoration: const InputDecoration(labelText: 'Doğrulama Kodu'),
            ),
            if (_phoneError != null) ...[
              Text(_phoneError!, style: const TextStyle(color: AppColors.red400)),
              const SizedBox(height: 8),
            ],
            ElevatedButton(
              onPressed: _isPhoneSubmitting ? null : _verifyCode,
              child: Text(_isPhoneSubmitting ? 'Doğrulanıyor...' : 'Doğrula'),
            ),
          ],
        ],
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Üyelik Planı Seç', style: TextStyle(color: AppColors.silver300, fontSize: 18)),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _PlanCard(
                label: 'Aylık',
                priceLabel: '499 ₺ / ay',
                selected: _plan == 'MONTHLY',
                onTap: () => setState(() => _plan = 'MONTHLY'),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _PlanCard(
                label: 'Yıllık',
                priceLabel: '4.990 ₺ / yıl',
                selected: _plan == 'YEARLY',
                onTap: () => setState(() => _plan = 'YEARLY'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        TextField(controller: _identityController, decoration: const InputDecoration(labelText: 'TCKN / VKN')),
        const SizedBox(height: 12),
        TextField(
          controller: _billingNameController,
          decoration: const InputDecoration(labelText: 'Fatura Yetkilisi Ad Soyad'),
        ),
        const SizedBox(height: 12),
        AppDropdown(
          label: 'Fatura Şehri',
          value: _billingCity,
          options: turkishProvinces.map((p) => Option(p, p)).toList(),
          onChanged: (v) => setState(() => _billingCity = v),
        ),
        TextField(
          controller: _billingAddressController,
          decoration: const InputDecoration(labelText: 'Fatura Adresi'),
        ),
        if (_checkoutError != null) ...[
          const SizedBox(height: 12),
          Text(_checkoutError!, style: const TextStyle(color: AppColors.red400)),
        ],
        const SizedBox(height: 20),
        ElevatedButton(
          onPressed: _isCheckoutSubmitting ? null : _startCheckout,
          child: Text(_isCheckoutSubmitting ? 'Yönlendiriliyor...' : 'Ödemeye Geç'),
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