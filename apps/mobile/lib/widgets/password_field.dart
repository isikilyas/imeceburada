import 'package:flutter/material.dart';

/// Şifre alanı — sağdaki göz ikonuyla girilen şifreyi göster/gizle.
class PasswordField extends StatefulWidget {
  const PasswordField({super.key, required this.controller, required this.labelText});

  final TextEditingController controller;
  final String labelText;

  @override
  State<PasswordField> createState() => _PasswordFieldState();
}

class _PasswordFieldState extends State<PasswordField> {
  bool _visible = false;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: widget.controller,
      obscureText: !_visible,
      decoration: InputDecoration(
        labelText: widget.labelText,
        suffixIcon: IconButton(
          icon: Icon(_visible ? Icons.visibility_off : Icons.visibility),
          onPressed: () => setState(() => _visible = !_visible),
        ),
      ),
    );
  }
}
