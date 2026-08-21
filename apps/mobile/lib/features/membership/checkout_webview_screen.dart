import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../core/api_client.dart';
import '../../core/auth_store.dart';
import '../../theme/app_theme.dart';

/// iyzico'nun `checkoutFormContent` HTML+JS içeriğini bir WebView'de açar.
/// Ödeme tamamlanınca iyzico, backend'in ayarladığı web callbackUrl'ine
/// yönlendirir; bu ekran o yönlendirmeyi yakalayıp token'ı alır ve mobil
/// tarafında `/membership/callback` çağrısını kendisi yapar (web sayfasına
/// gitmesine izin vermez, çünkü web'in localStorage'ındaki oturuma mobilin
/// erişimi yok).
class CheckoutWebViewScreen extends StatefulWidget {
  final String checkoutFormContent;
  const CheckoutWebViewScreen({super.key, required this.checkoutFormContent});

  @override
  State<CheckoutWebViewScreen> createState() => _CheckoutWebViewScreenState();
}

class _CheckoutWebViewScreenState extends State<CheckoutWebViewScreen> {
  late final WebViewController _controller;
  bool _isConfirming = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (request) {
            if (request.url.contains('/membership/callback')) {
              final token = Uri.parse(request.url).queryParameters['token'];
              if (token != null) _confirmCheckout(token);
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadHtmlString('''
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:16px;background:#0a0c10;">
    <div id="iyzipay-checkout-form" class="responsive"></div>
    ${widget.checkoutFormContent}
  </body>
</html>
''');
  }

  Future<void> _confirmCheckout(String token) async {
    if (_isConfirming) return;
    setState(() => _isConfirming = true);
    try {
      final result = await context
          .read<AuthStore>()
          .authorizedPost('/membership/callback?token=$token', body: null) as Map<String, dynamic>;
      if (!mounted) return;
      final isActive = result['status'] == 'ACTIVE';
      Navigator.of(context).pop(isActive);
    } on ApiException catch (_) {
      if (mounted) Navigator.of(context).pop(false);
    } catch (_) {
      if (mounted) Navigator.of(context).pop(false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ödeme')),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isConfirming)
            const Center(child: CircularProgressIndicator(color: AppColors.gold500)),
        ],
      ),
    );
  }
}