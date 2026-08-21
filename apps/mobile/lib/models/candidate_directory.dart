class CandidateDirectoryEntry {
  final String id;
  final String fullName;
  final String city;
  final String? district;
  final int experienceYears;
  final String? primaryTradeCategory;
  final List<String> skills;
  final List<String> workPreferences;
  final String? phone;
  final String availabilityStatus;

  const CandidateDirectoryEntry({
    required this.id,
    required this.fullName,
    required this.city,
    this.district,
    required this.experienceYears,
    this.primaryTradeCategory,
    required this.skills,
    required this.workPreferences,
    this.phone,
    this.availabilityStatus = 'AVAILABLE',
  });

  factory CandidateDirectoryEntry.fromJson(Map<String, dynamic> json) => CandidateDirectoryEntry(
        id: json['id'] as String,
        fullName: json['fullName'] as String,
        city: json['city'] as String,
        district: json['district'] as String?,
        experienceYears: json['experienceYears'] as int,
        primaryTradeCategory: json['primaryTradeCategory'] as String?,
        skills: (json['skills'] as List?)?.map((e) => e as String).toList() ?? [],
        workPreferences: (json['workPreferences'] as List?)?.map((e) => e as String).toList() ?? [],
        phone: json['phone'] as String?,
        availabilityStatus: json['availabilityStatus'] as String? ?? 'AVAILABLE',
      );
}