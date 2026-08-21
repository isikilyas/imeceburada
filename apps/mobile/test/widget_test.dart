import 'package:flutter_test/flutter_test.dart';

import 'package:bau360/main.dart';

void main() {
  testWidgets('Uygulama açılışta Canlı Piyasa sekmesini gösterir', (WidgetTester tester) async {
    await tester.pumpWidget(const ImeceYapiApp());
    await tester.pump();

    expect(find.text('Canlı Piyasa Endeksi'), findsOneWidget);
  });
}