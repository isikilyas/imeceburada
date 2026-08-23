import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/api_client.dart';
import 'core/auth_store.dart';
import 'core/locale_store.dart';
import 'features/home/root_tabs.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const ImeceBuradaApp());
}

class ImeceBuradaApp extends StatelessWidget {
  const ImeceBuradaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthStore(ApiClient())..init()),
        ChangeNotifierProvider(create: (_) => LocaleStore()..init()),
      ],
      child: MaterialApp(
        title: 'İmece Burada',
        debugShowCheckedModeBanner: false,
        theme: buildAppTheme(),
        home: const RootTabs(),
      ),
    );
  }
}