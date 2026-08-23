import 'package:flutter_test/flutter_test.dart';

import 'package:imeceburada/main.dart';

void main() {
  testWidgets('Uygulama açılışta Canlı Piyasa sekmesini gösterir', (WidgetTester tester) async {
    await tester.pumpWidget(const ImeceBuradaApp());
    await tester.pump();

    expect(find.text('Canlı Piyasa Endeksi'), findsOneWidget);
  });
}