class CandidateProfile {
  final String id;
  final String fullName;
  final String? phone;
  final String city;
  final String? district;
  final int experienceYears;
  final List<String> skills;
  final List<String> workPreferences;
  final String? primaryTradeCategory;
  final bool isPublic;
  final String availabilityStatus;

  const CandidateProfile({
    required this.id,
    required this.fullName,
    this.phone,
    required this.city,
    this.district,
    required this.experienceYears,
    required this.skills,
    required this.workPreferences,
    this.primaryTradeCategory,
    required this.isPublic,
    this.availabilityStatus = 'AVAILABLE',
  });

  factory CandidateProfile.fromJson(Map<String, dynamic> json) => CandidateProfile(
        id: json['id'] as String,
        fullName: json['fullName'] as String,
        phone: json['phone'] as String?,
        city: json['city'] as String,
        district: json['district'] as String?,
        experienceYears: json['experienceYears'] as int,
        skills: (json['skills'] as List?)?.map((e) => e as String).toList() ?? [],
        workPreferences: (json['workPreferences'] as List?)?.map((e) => e as String).toList() ?? [],
        primaryTradeCategory: json['primaryTradeCategory'] as String?,
        isPublic: json['isPublic'] as bool? ?? false,
        availabilityStatus: json['availabilityStatus'] as String? ?? 'AVAILABLE',
      );
}