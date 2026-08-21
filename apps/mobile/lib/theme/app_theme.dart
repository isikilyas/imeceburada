import 'package:flutter/material.dart';

/// İmece Yapı marka renkleri — web (Next.js/Tailwind) tarafındaki paletle birebir aynı,
/// platformlar arası görsel tutarlılık için.
class AppColors {
  AppColors._();

  static const ink950 = Color(0xFF0A0C10);
  static const ink900 = Color(0xFF12151B);
  static const ink800 = Color(0xFF1A1E26);
  static const ink700 = Color(0xFF262B35);

  static const gold500 = Color(0xFFD4AF37);
  static const gold400 = Color(0xFFE6C869);

  static const silver300 = Color(0xFFE4E6EA);
  static const silver400 = Color(0xFFC7CBD1);
  static const silver500 = Color(0xFF9AA0AA);

  static const red400 = Color(0xFFF87171);
  static const green400 = Color(0xFF4ADE80);
}

ThemeData buildAppTheme() {
  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.ink950,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.gold500,
      secondary: AppColors.gold400,
      surface: AppColors.ink900,
      onPrimary: AppColors.ink950,
      onSurface: AppColors.silver300,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.ink950,
      foregroundColor: AppColors.silver300,
      elevation: 0,
      centerTitle: false,
    ),
    cardTheme: CardThemeData(
      color: AppColors.ink900,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: const BorderSide(color: AppColors.ink800),
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.ink900,
      selectedItemColor: AppColors.gold500,
      unselectedItemColor: AppColors.silver500,
      type: BottomNavigationBarType.fixed,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.ink900,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.ink700),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.ink700),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.gold500),
      ),
      labelStyle: const TextStyle(color: AppColors.silver500),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.gold500,
        foregroundColor: AppColors.ink950,
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        textStyle: const TextStyle(fontWeight: FontWeight.w600),
      ),
    ),
    textTheme: const TextTheme(
      titleLarge: TextStyle(color: AppColors.silver300, fontWeight: FontWeight.w700),
      titleMedium: TextStyle(color: AppColors.silver300, fontWeight: FontWeight.w600),
      bodyMedium: TextStyle(color: AppColors.silver300),
      bodySmall: TextStyle(color: AppColors.silver500),
    ),
  );
}
