import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/locale_store.dart';
import '../../theme/app_theme.dart';

/// Şifre sıfırlama linki e-postayla gönderilir; linki tamamlama (yeni şifre
/// belirleme) tarayıcı üzerinden web'de yapılır — mobil derin bağlantı (deep
/// link) kurulumu ayrı bir iş, şu an sadece istek gönderme ekranı var.
class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _api = ApiClient();
  final _emailController = TextEditingController();
  bool _isSubmitting = false;
  bool _done = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _isSubmitting = true;
      _error = null;
    });
    try {
      await _api.post('/auth/forgot-password', body: {'email': _emailController.text.trim()});
      setState(() => _done = true);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      if (mounted) {
        setState(() => _error = context.read<LocaleStore>().t('auth.forgotPasswordRequestFailed'));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return Scaffold(
      appBar: AppBar(title: Text(t('auth.forgotPasswordTitle'))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_done)
            Text(
              t('auth.forgotPasswordDone'),
              style: const TextStyle(color: AppColors.silver300),
            )
          else ...[
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(labelText: t('auth.emailLabel')),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: const TextStyle(color: AppColors.red400)),
            ],
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submit,
              child: Text(_isSubmitting ? t('auth.forgotPasswordSubmitting') : t('auth.forgotPasswordSubmitButton')),
            ),
          ],
        ],
      ),
    );
  }
}