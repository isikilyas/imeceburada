import 'package:flutter_test/flutter_test.dart';

import 'package:imeceburada/main.dart';

void main() {
  testWidgets('Uygulama açılışta Ana Sayfa sekmesini gösterir', (WidgetTester tester) async {
    await tester.pumpWidget(const ImeceBuradaApp());
    await tester.pump();

    expect(find.text('Ne Arıyorsun?'), findsOneWidget);
  });
}