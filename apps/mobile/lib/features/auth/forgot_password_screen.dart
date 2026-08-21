import 'package:flutter/material.dart';
import '../../core/api_client.dart';
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
      setState(() => _error = 'İstek gönderilemedi');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Şifremi Unuttum')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_done)
            const Text(
              'Girdiğin e-posta adresi sistemde kayıtlıysa, şifre sıfırlama linkini içeren bir e-posta gönderildi.',
              style: TextStyle(color: AppColors.silver300),
            )
          else ...[
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: 'E-posta'),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: const TextStyle(color: AppColors.red400)),
            ],
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submit,
              child: Text(_isSubmitting ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'),
            ),
          ],
        ],
      ),
    );
  }
}