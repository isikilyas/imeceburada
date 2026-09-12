import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/auth_store.dart';
import '../theme/app_theme.dart';

/// İş/ekipman/malzeme/şantiye çağrısı detay ekranlarında kullanılan favori
/// kalp düğmesi — web'deki FavoriteButton ile aynı davranış: giriş yapılmamışsa
/// gizlenir, tıklandığında anında görsel geri bildirim verir.
class FavoriteToggleButton extends StatefulWidget {
  final String listingType;
  final String listingId;

  const FavoriteToggleButton({super.key, required this.listingType, required this.listingId});

  @override
  State<FavoriteToggleButton> createState() => _FavoriteToggleButtonState();
}

class _FavoriteToggleButtonState extends State<FavoriteToggleButton> {
  bool? _isFavorited;
  bool _isPending = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final auth = context.read<AuthStore>();
    if (!auth.isAuthenticated) return;
    try {
      final raw = await auth.authorizedGet('/favorites');
      final match = (raw as List).cast<Map<String, dynamic>>().any(
            (f) => f['listingType'] == widget.listingType && f['listingId'] == widget.listingId,
          );
      if (mounted) setState(() => _isFavorited = match);
    } catch (_) {
      // sessizce geç — kalp düğmesi gizli kalır
    }
  }

  Future<void> _toggle() async {
    if (_isPending || _isFavorited == null) return;
    final auth = context.read<AuthStore>();
    final wasFavorited = _isFavorited!;
    setState(() {
      _isPending = true;
      _isFavorited = !wasFavorited;
    });
    try {
      if (wasFavorited) {
        await auth.authorizedDelete('/favorites/${widget.listingType}/${widget.listingId}');
      } else {
        await auth.authorizedPost('/favorites', body: {
          'listingType': widget.listingType,
          'listingId': widget.listingId,
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isFavorited = wasFavorited);
    } finally {
      if (mounted) setState(() => _isPending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthStore>();
    if (!auth.isAuthenticated || _isFavorited == null) return const SizedBox.shrink();
    return IconButton(
      onPressed: _isPending ? null : _toggle,
      icon: Icon(
        _isFavorited! ? Icons.favorite : Icons.favorite_border,
        color: _isFavorited! ? AppColors.gold500 : AppColors.silver400,
      ),
    );
  }
}
