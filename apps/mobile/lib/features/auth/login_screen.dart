import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/locale_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/password_field.dart';
import 'forgot_password_screen.dart';
import 'register_screen.dart';

const _rememberedIdentifierKey = 'imeceburada.rememberedIdentifier';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _rememberIdentifier = false;
  bool _isSubmitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadRememberedIdentifier();
  }

  Future<void> _loadRememberedIdentifier() async {
    final prefs = await SharedPreferences.getInstance();
    final remembered = prefs.getString(_rememberedIdentifierKey);
    if (remembered != null && mounted) {
      setState(() {
        _identifierController.text = remembered;
        _rememberIdentifier = true;
      });
    }
  }

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _isSubmitting = true;
      _error = null;
    });
    try {
      await context.read<AuthStore>().login(
            identifier: _identifierController.text.trim(),
            password: _passwordController.text,
          );
      final prefs = await SharedPreferences.getInstance();
      if (_rememberIdentifier) {
        await prefs.setString(_rememberedIdentifierKey, _identifierController.text.trim());
      } else {
        await prefs.remove(_rememberedIdentifierKey);
      }
      if (mounted) Navigator.of(context).pop();
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = context.read<LocaleStore>().t('auth.loginFailedGeneric'));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return Scaffold(
      appBar: AppBar(title: Text(t('auth.loginTitle'))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _identifierController,
            keyboardType: TextInputType.emailAddress,
            decoration: InputDecoration(labelText: t('auth.identifierLabel')),
          ),
          const SizedBox(height: 12),
          PasswordField(controller: _passwordController, labelText: t('auth.passwordLabel')),
          CheckboxListTile(
            value: _rememberIdentifier,
            onChanged: (v) => setState(() => _rememberIdentifier = v ?? false),
            title: Text(t('auth.rememberMeLabel'), style: const TextStyle(color: AppColors.silver300, fontSize: 14)),
            controlAffinity: ListTileControlAffinity.leading,
            contentPadding: EdgeInsets.zero,
            activeColor: AppColors.gold500,
          ),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const ForgotPasswordScreen()),
              ),
              child: Text(t('auth.forgotPasswordLink'), style: const TextStyle(color: AppColors.silver400)),
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: AppColors.red400)),
          ],
          const SizedBox(height: 8),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submit,
            child: Text(_isSubmitting ? t('auth.loginSubmitting') : t('auth.loginButton')),
          ),
          const SizedBox(height: 16),
          TextButton(
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const RegisterScreen()),
            ),
            child: Text(t('auth.noAccountRegisterLink'), style: const TextStyle(color: AppColors.gold400)),
          ),
        ],
      ),
    );
  }
}
