import 'package:flutter/material.dart';

/// Basit, bağımlılık gerektirmeyen giriş animasyonu — web tarafındaki
/// `animate-fade-in-up` CSS yardımcı sınıfının mobildeki karşılığı.
/// [delay] ile liste/kart gruplarında sıralı (staggered) bir giriş sağlanır.
class FadeInUp extends StatefulWidget {
  final Widget child;
  final Duration delay;

  const FadeInUp({super.key, required this.child, this.delay = Duration.zero});

  @override
  State<FadeInUp> createState() => _FadeInUpState();
}

class _FadeInUpState extends State<FadeInUp> {
  bool _visible = false;

  @override
  void initState() {
    super.initState();
    Future.delayed(widget.delay, () {
      if (mounted) setState(() => _visible = true);
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSlide(
      offset: _visible ? Offset.zero : const Offset(0, 0.08),
      duration: const Duration(milliseconds: 420),
      curve: Curves.easeOutCubic,
      child: AnimatedOpacity(
        opacity: _visible ? 1 : 0,
        duration: const Duration(milliseconds: 420),
        curve: Curves.easeOutCubic,
        child: widget.child,
      ),
    );
  }
}
