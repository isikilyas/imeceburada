import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

/// Bir ilanı herhangi bir WhatsApp sohbeti/grubuna paylaşmak için — sabit bir
/// kişiye değil, kullanıcının kendi WhatsApp'ındaki paylaşım seçicisini açar.
/// WhatsAppContactButton'dan farkı budur (o belirli bir numarayla sohbet açar).
class WhatsAppShareButton extends StatelessWidget {
  final String text;
  const WhatsAppShareButton({super.key, required this.text});

  Future<void> _share() async {
    final uri = Uri.parse('https://wa.me/?text=${Uri.encodeComponent(text)}');
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      tooltip: "WhatsApp'ta Paylaş",
      icon: const Icon(Icons.share_outlined),
      onPressed: _share,
    );
  }
}