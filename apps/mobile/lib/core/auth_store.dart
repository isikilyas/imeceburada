import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/auth.dart';
import 'api_client.dart';

const _storageKey = 'bau360.auth';

/// Kimlik doğrulama durumunu tutan basit bir ChangeNotifier — Provider ile
/// widget ağacına sağlanır (bkz. main.dart).
class AuthStore extends ChangeNotifier {
  AuthStore(this._api);

  final ApiClient _api;
  AuthSession? _session;
  bool isLoading = true;

  AuthSession? get session => _session;
  AuthUser? get user => _session?.user;
  bool get isAuthenticated => _session != null;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    if (raw != null) {
      try {
        _session = AuthSession.fromStorageJson(jsonDecode(raw) as Map<String, dynamic>);
      } catch (_) {
        await prefs.remove(_storageKey);
      }
    }
    isLoading = false;
    notifyListeners();
  }

  Future<void> _persist(AuthSession? session) async {
    _session = session;
    final prefs = await SharedPreferences.getInstance();
    if (session != null) {
      await prefs.setString(_storageKey, jsonEncode(session.toStorageJson()));
    } else {
      await prefs.remove(_storageKey);
    }
    notifyListeners();
  }

  Future<void> login({required String email, required String password}) async {
    final json = await _api.post('/auth/login', body: {'email': email, 'password': password});
    await _persist(AuthSession.fromAuthResponseJson(json as Map<String, dynamic>));
  }

  Future<void> registerCandidate({
    required String email,
    required String password,
    required String fullName,
    required String city,
    String? district,
  }) async {
    final json = await _api.post('/auth/register/candidate', body: {
      'email': email,
      'password': password,
      'fullName': fullName,
      'city': city,
      if (district != null && district.isNotEmpty) 'district': district,
    });
    await _persist(AuthSession.fromAuthResponseJson(json as Map<String, dynamic>));
  }

  Future<void> registerCompany({
    required String email,
    required String password,
    required String companyName,
    required String city,
    String? district,
  }) async {
    final json = await _api.post('/auth/register/company', body: {
      'email': email,
      'password': password,
      'companyName': companyName,
      'city': city,
      if (district != null && district.isNotEmpty) 'district': district,
    });
    await _persist(AuthSession.fromAuthResponseJson(json as Map<String, dynamic>));
  }

  Future<void> registerSupplier({
    required String email,
    required String password,
    required String companyName,
    required String city,
    String? district,
    List<String>? supplyCategories,
  }) async {
    final json = await _api.post('/auth/register/supplier', body: {
      'email': email,
      'password': password,
      'companyName': companyName,
      'city': city,
      if (district != null && district.isNotEmpty) 'district': district,
      if (supplyCategories != null && supplyCategories.isNotEmpty) 'supplyCategories': supplyCategories,
    });
    await _persist(AuthSession.fromAuthResponseJson(json as Map<String, dynamic>));
  }

  Future<void> registerSubcontractor({
    required String email,
    required String password,
    required String companyName,
    required String city,
    String? district,
    required List<String> tradeCategories,
    String? description,
  }) async {
    final json = await _api.post('/auth/register/subcontractor', body: {
      'email': email,
      'password': password,
      'companyName': companyName,
      'city': city,
      if (district != null && district.isNotEmpty) 'district': district,
      'tradeCategories': tradeCategories,
      if (description != null && description.isNotEmpty) 'description': description,
    });
    await _persist(AuthSession.fromAuthResponseJson(json as Map<String, dynamic>));
  }

  Future<void> logout() async {
    await _persist(null);
  }

  /// Erişim token'ı süresi dolmuşsa refresh token ile bir kez daha dener,
  /// ardından [call]'ı güncel access token ile çalıştırır. get/post/patch/delete
  /// yardımcıları bu ortak yeniden deneme mantığını paylaşır.
  Future<dynamic> _withRefresh(Future<dynamic> Function(String accessToken) call) async {
    final current = _session;
    if (current == null) throw ApiException(401, 'Oturum açmanız gerekiyor');
    try {
      return await call(current.accessToken);
    } on ApiException catch (e) {
      if (e.statusCode != 401) rethrow;
      final refreshed = await _api.post('/auth/refresh', body: {'refreshToken': current.refreshToken});
      final refreshedMap = refreshed as Map<String, dynamic>;
      final nextSession = current.copyWithTokens(
        accessToken: refreshedMap['accessToken'] as String,
        refreshToken: refreshedMap['refreshToken'] as String,
      );
      await _persist(nextSession);
      return call(nextSession.accessToken);
    }
  }

  Future<dynamic> authorizedGet(String path, {Map<String, String>? query}) =>
      _withRefresh((token) => _api.get(path, query: query, accessToken: token));

  Future<dynamic> authorizedPost(String path, {Map<String, dynamic>? body}) =>
      _withRefresh((token) => _api.post(path, body: body, accessToken: token));

  Future<dynamic> authorizedPatch(String path, {Map<String, dynamic>? body}) =>
      _withRefresh((token) => _api.patch(path, body: body, accessToken: token));

  Future<dynamic> authorizedDelete(String path) =>
      _withRefresh((token) => _api.delete(path, accessToken: token));
}
