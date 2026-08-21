class AuthUser {
  final String id;
  final String email;
  final String role; // CANDIDATE | COMPANY | SUPPLIER | SUBCONTRACTOR | ADMIN

  const AuthUser({required this.id, required this.email, required this.role});

  factory AuthUser.fromJson(Map<String, dynamic> json) => AuthUser(
        id: json['id'] as String,
        email: json['email'] as String,
        role: json['role'] as String,
      );

  Map<String, dynamic> toJson() => {'id': id, 'email': email, 'role': role};
}

class AuthSession {
  final AuthUser user;
  final String accessToken;
  final String refreshToken;

  const AuthSession({required this.user, required this.accessToken, required this.refreshToken});

  factory AuthSession.fromAuthResponseJson(Map<String, dynamic> json) => AuthSession(
        user: AuthUser.fromJson(json['user'] as Map<String, dynamic>),
        accessToken: json['accessToken'] as String,
        refreshToken: json['refreshToken'] as String,
      );

  factory AuthSession.fromStorageJson(Map<String, dynamic> json) => AuthSession(
        user: AuthUser.fromJson(json['user'] as Map<String, dynamic>),
        accessToken: json['accessToken'] as String,
        refreshToken: json['refreshToken'] as String,
      );

  Map<String, dynamic> toStorageJson() => {
        'user': user.toJson(),
        'accessToken': accessToken,
        'refreshToken': refreshToken,
      };

  AuthSession copyWithTokens({required String accessToken, required String refreshToken}) => AuthSession(
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      );
}
