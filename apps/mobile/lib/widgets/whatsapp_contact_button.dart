import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/phone.dart';
import '../theme/app_theme.dart';

/// Bir kişiyi WhatsApp üzerinden doğrudan iletişime geçmeye davet eden buton —
/// hazır mesajla o numarayla bir sohbet açar (wa.me/<numara>?text=...).
class WhatsAppContactButton extends StatelessWidget {
  final String phone;
  final String message;
  final bool disabled;
  final String disabledLabel;

  const WhatsAppContactButton({
    super.key,
    required this.phone,
    required this.message,
    this.disabled = false,
    this.disabledLabel = 'Şu an müsait değil',
  });

  Future<void> _open() async {
    final uri = Uri.parse(
      'https://wa.me/${toWhatsAppPhone(phone)}?text=${Uri.encodeComponent(message)}',
    );
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    if (disabled) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.ink800),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          '🔴 $disabledLabel',
          style: const TextStyle(color: AppColors.silver500, fontSize: 13),
        ),
      );
    }
    return ElevatedButton.icon(
      onPressed: _open,
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF16A34A),
        foregroundColor: Colors.white,
      ),
      icon: const Text('💬'),
      label: const Text('WhatsApp ile İletişime Geç'),
    );
  }
}