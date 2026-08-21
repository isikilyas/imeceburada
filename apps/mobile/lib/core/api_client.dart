import 'dart:convert';
import 'package:http/http.dart' as http;

/// API taban adresi. Fiziksel cihaz/emülatörde localhost farklı anlamlara gelir:
/// - Android emülatör: 10.0.2.2
/// - iOS simülatör: localhost
/// Çalıştırırken override etmek için: flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3001/api
const String _defaultBaseUrl = 'http://localhost:3001/api';

class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException(this.statusCode, this.message);

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({String? baseUrl})
      : baseUrl = baseUrl ??
            const String.fromEnvironment('API_BASE_URL', defaultValue: _defaultBaseUrl);

  final String baseUrl;

  Future<dynamic> get(String path, {Map<String, String>? query, String? accessToken}) async {
    final uri = Uri.parse('$baseUrl$path').replace(queryParameters: query);
    final response = await http.get(
      uri,
      headers: {
        'Content-Type': 'application/json',
        if (accessToken != null) 'Authorization': 'Bearer $accessToken',
      },
    );
    return _handle(response);
  }

  Future<dynamic> post(String path, {Map<String, dynamic>? body, String? accessToken}) async {
    final uri = Uri.parse('$baseUrl$path');
    final response = await http.post(
      uri,
      headers: {
        'Content-Type': 'application/json',
        if (accessToken != null) 'Authorization': 'Bearer $accessToken',
      },
      body: body != null ? jsonEncode(body) : null,
    );
    return _handle(response);
  }

  Future<dynamic> patch(String path, {Map<String, dynamic>? body, String? accessToken}) async {
    final uri = Uri.parse('$baseUrl$path');
    final response = await http.patch(
      uri,
      headers: {
        'Content-Type': 'application/json',
        if (accessToken != null) 'Authorization': 'Bearer $accessToken',
      },
      body: body != null ? jsonEncode(body) : null,
    );
    return _handle(response);
  }

  Future<dynamic> delete(String path, {String? accessToken}) async {
    final uri = Uri.parse('$baseUrl$path');
    final response = await http.delete(
      uri,
      headers: {
        'Content-Type': 'application/json',
        if (accessToken != null) 'Authorization': 'Bearer $accessToken',
      },
    );
    return _handle(response);
  }

  dynamic _handle(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(utf8.decode(response.bodyBytes));
    }
    String message = 'Bir hata oluştu';
    try {
      final decoded = jsonDecode(utf8.decode(response.bodyBytes));
      if (decoded is Map && decoded['message'] != null) {
        final m = decoded['message'];
        message = m is List ? m.join(', ') : m.toString();
      }
    } catch (_) {
      // gövde JSON değilse varsayılan mesaj kullanılır
    }
    throw ApiException(response.statusCode, message);
  }
}
