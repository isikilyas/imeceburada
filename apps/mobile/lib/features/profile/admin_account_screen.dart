import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../core/locale_store.dart';
import '../../theme/app_theme.dart';
import '../../widgets/password_field.dart';

class AdminAccountScreen extends StatefulWidget {
  const AdminAccountScreen({super.key});

  @override
  State<AdminAccountScreen> createState() => _AdminAccountScreenState();
}

class _AdminAccountScreenState extends State<AdminAccountScreen> {
  bool _isLoading = true;
  String? _loadError;
  Map<String, dynamic>? _profile;

  final _titleController = TextEditingController();
  final _phoneController = TextEditingController();
  String _saveStatus = '';
  String? _saveError;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _loadError = null;
    });
    try {
      final raw = await context.read<AuthStore>().authorizedGet('/users/me/profile');
      final profile = raw as Map<String, dynamic>;
      setState(() {
        _profile = profile;
        _titleController.text = profile['title'] as String? ?? '';
        _phoneController.text = profile['phone'] as String? ?? '';
      });
    } on ApiException catch (e) {
      setState(() => _loadError = e.message);
    } catch (_) {
      setState(() => _loadError = context.read<LocaleStore>().t('adminAccount.connectionError'));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _save() async {
    setState(() {
      _saveStatus = 'saving';
      _saveError = null;
    });
    try {
      await context.read<AuthStore>().authorizedPatch('/users/me/profile/admin', body: {
        'title': _titleController.text.trim().isEmpty ? null : _titleController.text.trim(),
        'phone': _phoneController.text.trim().isEmpty ? null : _phoneController.text.trim(),
      });
      setState(() => _saveStatus = 'saved');
    } on ApiException catch (e) {
      setState(() {
        _saveStatus = '';
        _saveError = e.message;
      });
    } catch (_) {
      setState(() {
        _saveStatus = '';
        _saveError = context.read<LocaleStore>().t('adminAccount.saveFailed');
      });
    }
  }

  String _formatDate(String? iso) {
    if (iso == null) return '-';
    final dt = DateTime.tryParse(iso);
    if (dt == null) return '-';
    return '${dt.day.toString().padLeft(2, '0')}.${dt.month.toString().padLeft(2, '0')}.${dt.year}';
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return Scaffold(
      appBar: AppBar(title: Text(t('adminAccount.title'))),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold500))
          : _loadError != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(_loadError!, style: const TextStyle(color: AppColors.red400)),
                  ),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _InfoCard(profile: _profile!, formatDate: _formatDate, t: t),
                      const SizedBox(height: 16),
                      _SectionCard(
                        title: t('adminAccount.infoHeading'),
                        children: [
                          TextField(
                            controller: _titleController,
                            decoration: InputDecoration(labelText: t('adminAccount.titleLabel')),
                          ),
                          const SizedBox(height: 12),
                          TextField(
                            controller: _phoneController,
                            decoration: InputDecoration(labelText: t('adminAccount.phoneLabel')),
                          ),
                          if (_saveError != null) ...[
                            const SizedBox(height: 8),
                            Text(_saveError!, style: const TextStyle(color: AppColors.red400, fontSize: 12)),
                          ],
                          if (_saveStatus == 'saved') ...[
                            const SizedBox(height: 8),
                            Text(t('adminAccount.saved'), style: const TextStyle(color: Colors.green, fontSize: 12)),
                          ],
                          const SizedBox(height: 12),
                          ElevatedButton(
                            onPressed: _saveStatus == 'saving' ? null : _save,
                            child: Text(_saveStatus == 'saving' ? t('adminAccount.saving') : t('adminAccount.saveButton')),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const _ChangePasswordSection(),
                      const SizedBox(height: 16),
                      const _ChangeEmailSection(),
                      const SizedBox(height: 16),
                      const _LogoutAllSection(),
                      const SizedBox(height: 16),
                      const _DeleteAccountSection(),
                    ],
                  ),
                ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.profile, required this.formatDate, required this.t});

  final Map<String, dynamic> profile;
  final String Function(String?) formatDate;
  final String Function(String key, {Map<String, String>? vars}) t;

  @override
  Widget build(BuildContext context) {
    final pendingEmail = profile['pendingEmail'] as String?;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.ink900,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.ink700),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _InfoRow(label: t('adminAccount.emailLabel'), value: profile['email'] as String? ?? '-'),
          const SizedBox(height: 8),
          _InfoRow(label: t('adminAccount.createdAtLabel'), value: formatDate(profile['accountCreatedAt'] as String?)),
          const SizedBox(height: 8),
          _InfoRow(label: t('adminAccount.lastLoginLabel'), value: formatDate(profile['lastLoginAt'] as String?)),
          if (pendingEmail != null) ...[
            const SizedBox(height: 12),
            Text(
              t('adminAccount.pendingEmailNotice', vars: {'email': pendingEmail}),
              style: const TextStyle(color: AppColors.gold400, fontSize: 12),
            ),
          ],
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppColors.silver500, fontSize: 13)),
        Text(value, style: const TextStyle(color: AppColors.silver300, fontSize: 13, fontWeight: FontWeight.w500)),
      ],
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.ink900,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.ink700),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: AppColors.silver300, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }
}

class _ChangePasswordSection extends StatefulWidget {
  const _ChangePasswordSection();

  @override
  State<_ChangePasswordSection> createState() => _ChangePasswordSectionState();
}

class _ChangePasswordSectionState extends State<_ChangePasswordSection> {
  final _currentController = TextEditingController();
  final _newController = TextEditingController();
  String _status = '';
  String? _error;

  @override
  void dispose() {
    _currentController.dispose();
    _newController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _status = 'saving';
      _error = null;
    });
    try {
      await context.read<AuthStore>().authorizedPatch('/users/me/password', body: {
        'currentPassword': _currentController.text,
        'newPassword': _newController.text,
      });
      _currentController.clear();
      _newController.clear();
      setState(() => _status = 'saved');
    } on ApiException catch (e) {
      setState(() {
        _status = '';
        _error = e.message;
      });
    } catch (_) {
      setState(() {
        _status = '';
        _error = context.read<LocaleStore>().t('adminAccount.security.changePasswordFailed');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return _SectionCard(
      title: t('adminAccount.security.changePasswordHeading'),
      children: [
        PasswordField(controller: _currentController, labelText: t('adminAccount.security.currentPasswordLabel')),
        const SizedBox(height: 12),
        PasswordField(controller: _newController, labelText: t('adminAccount.security.newPasswordLabel')),
        if (_error != null) ...[
          const SizedBox(height: 8),
          Text(_error!, style: const TextStyle(color: AppColors.red400, fontSize: 12)),
        ],
        if (_status == 'saved') ...[
          const SizedBox(height: 8),
          Text(t('adminAccount.security.passwordChanged'), style: const TextStyle(color: Colors.green, fontSize: 12)),
        ],
        const SizedBox(height: 12),
        ElevatedButton(
          onPressed: _status == 'saving' ? null : _submit,
          child: Text(_status == 'saving'
              ? t('adminAccount.security.changingPassword')
              : t('adminAccount.security.changePasswordButton')),
        ),
      ],
    );
  }
}

class _ChangeEmailSection extends StatefulWidget {
  const _ChangeEmailSection();

  @override
  State<_ChangeEmailSection> createState() => _ChangeEmailSectionState();
}

class _ChangeEmailSectionState extends State<_ChangeEmailSection> {
  final _newEmailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _codeController = TextEditingController();
  bool _confirmStep = false;
  String _status = '';
  String? _error;
  bool _changed = false;

  @override
  void dispose() {
    _newEmailController.dispose();
    _passwordController.dispose();
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _requestChange() async {
    setState(() {
      _status = 'sending';
      _error = null;
    });
    try {
      await context.read<AuthStore>().authorizedPost('/users/me/email/request-change', body: {
        'newEmail': _newEmailController.text.trim(),
        'password': _passwordController.text,
      });
      setState(() {
        _status = '';
        _confirmStep = true;
      });
    } on ApiException catch (e) {
      setState(() {
        _status = '';
        _error = e.message;
      });
    } catch (_) {
      setState(() {
        _status = '';
        _error = context.read<LocaleStore>().t('adminAccount.changeEmail.requestFailed');
      });
    }
  }

  Future<void> _confirmChange() async {
    setState(() {
      _status = 'verifying';
      _error = null;
    });
    try {
      await context
          .read<AuthStore>()
          .authorizedPost('/users/me/email/confirm-change', body: {'code': _codeController.text.trim()});
      _newEmailController.clear();
      _passwordController.clear();
      _codeController.clear();
      setState(() {
        _status = '';
        _confirmStep = false;
        _changed = true;
      });
    } on ApiException catch (e) {
      setState(() {
        _status = '';
        _error = e.message;
      });
    } catch (_) {
      setState(() {
        _status = '';
        _error = context.read<LocaleStore>().t('adminAccount.changeEmail.confirmFailed');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return _SectionCard(
      title: t('adminAccount.changeEmail.heading'),
      children: _confirmStep
          ? [
              Text(t('adminAccount.changeEmail.confirmHint'), style: const TextStyle(color: AppColors.silver500, fontSize: 12)),
              const SizedBox(height: 12),
              TextField(
                controller: _codeController,
                maxLength: 6,
                decoration: InputDecoration(labelText: t('adminAccount.changeEmail.codeLabel')),
              ),
              if (_error != null) ...[
                const SizedBox(height: 8),
                Text(_error!, style: const TextStyle(color: AppColors.red400, fontSize: 12)),
              ],
              const SizedBox(height: 8),
              Row(
                children: [
                  ElevatedButton(
                    onPressed: _status == 'verifying' ? null : _confirmChange,
                    child: Text(_status == 'verifying'
                        ? t('adminAccount.changeEmail.verifying')
                        : t('adminAccount.changeEmail.verifyButton')),
                  ),
                  const SizedBox(width: 8),
                  TextButton(
                    onPressed: () => setState(() => _confirmStep = false),
                    child: Text(t('adminAccount.changeEmail.cancelButton')),
                  ),
                ],
              ),
            ]
          : [
              TextField(
                controller: _newEmailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(labelText: t('adminAccount.changeEmail.newEmailLabel')),
              ),
              const SizedBox(height: 12),
              PasswordField(controller: _passwordController, labelText: t('adminAccount.changeEmail.passwordLabel')),
              if (_error != null) ...[
                const SizedBox(height: 8),
                Text(_error!, style: const TextStyle(color: AppColors.red400, fontSize: 12)),
              ],
              if (_changed) ...[
                const SizedBox(height: 8),
                Text(t('adminAccount.changeEmail.changed'), style: const TextStyle(color: Colors.green, fontSize: 12)),
              ],
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: _status == 'sending' ? null : _requestChange,
                child: Text(_status == 'sending'
                    ? t('adminAccount.changeEmail.sendingCode')
                    : t('adminAccount.changeEmail.sendCodeButton')),
              ),
            ],
    );
  }
}

class _LogoutAllSection extends StatefulWidget {
  const _LogoutAllSection();

  @override
  State<_LogoutAllSection> createState() => _LogoutAllSectionState();
}

class _LogoutAllSectionState extends State<_LogoutAllSection> {
  bool _isSubmitting = false;
  String? _error;

  Future<void> _submit() async {
    setState(() {
      _isSubmitting = true;
      _error = null;
    });
    try {
      await context.read<AuthStore>().authorizedPost('/users/me/logout-all');
      if (!mounted) return;
      await context.read<AuthStore>().logout();
      if (!mounted) return;
      Navigator.of(context).popUntil((route) => route.isFirst);
    } on ApiException catch (e) {
      setState(() {
        _isSubmitting = false;
        _error = e.message;
      });
    } catch (_) {
      setState(() {
        _isSubmitting = false;
        _error = context.read<LocaleStore>().t('adminAccount.logoutAll.failed');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return _SectionCard(
      title: t('adminAccount.logoutAll.heading'),
      children: [
        Text(t('adminAccount.logoutAll.hint'), style: const TextStyle(color: AppColors.silver500, fontSize: 12)),
        if (_error != null) ...[
          const SizedBox(height: 8),
          Text(_error!, style: const TextStyle(color: AppColors.red400, fontSize: 12)),
        ],
        const SizedBox(height: 12),
        OutlinedButton(
          onPressed: _isSubmitting ? null : _submit,
          child: Text(_isSubmitting ? t('adminAccount.logoutAll.loggingOut') : t('adminAccount.logoutAll.button')),
        ),
      ],
    );
  }
}

class _DeleteAccountSection extends StatefulWidget {
  const _DeleteAccountSection();

  @override
  State<_DeleteAccountSection> createState() => _DeleteAccountSectionState();
}

class _DeleteAccountSectionState extends State<_DeleteAccountSection> {
  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return _SectionCard(
      title: t('profile.deleteAccountButton'),
      children: [
        TextButton(
          onPressed: () => showDialog(
            context: context,
            builder: (_) => const _DeleteAccountDialog(),
          ),
          style: TextButton.styleFrom(foregroundColor: AppColors.red400),
          child: Text(t('profile.deleteAccountButton')),
        ),
      ],
    );
  }
}

class _DeleteAccountDialog extends StatefulWidget {
  const _DeleteAccountDialog();

  @override
  State<_DeleteAccountDialog> createState() => _DeleteAccountDialogState();
}

class _DeleteAccountDialogState extends State<_DeleteAccountDialog> {
  final _passwordController = TextEditingController();
  bool _isSubmitting = false;
  String? _error;

  @override
  void dispose() {
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _confirm() async {
    setState(() {
      _isSubmitting = true;
      _error = null;
    });
    try {
      await context.read<AuthStore>().deleteAccount(password: _passwordController.text);
      if (mounted) Navigator.of(context).pop();
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = context.read<LocaleStore>().t('profile.deleteAccountFailed'));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.watch<LocaleStore>().t;
    return AlertDialog(
      title: Text(t('profile.deleteAccountDialogTitle')),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(t('profile.deleteAccountDialogWarning'), style: const TextStyle(fontSize: 13)),
          const SizedBox(height: 16),
          PasswordField(controller: _passwordController, labelText: t('profile.deleteAccountPasswordLabel')),
          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(_error!, style: const TextStyle(color: AppColors.red400, fontSize: 12)),
          ],
        ],
      ),
      actions: [
        TextButton(
          onPressed: _isSubmitting ? null : () => Navigator.of(context).pop(),
          child: Text(t('profile.deleteAccountCancelButton')),
        ),
        TextButton(
          onPressed: _isSubmitting ? null : _confirm,
          style: TextButton.styleFrom(foregroundColor: AppColors.red400),
          child: Text(t('profile.deleteAccountConfirmButton')),
        ),
      ],
    );
  }
}
