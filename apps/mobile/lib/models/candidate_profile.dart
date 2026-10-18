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
  final bool phoneVisible;
  final String availabilityStatus;
  final int? expectedSalaryMin;
  final String? expectedSalaryPeriod;
  final String? availableFrom;
  final bool notifyByEmail;
  final bool hasProfessionalQualificationCert;
  final bool hasMasterCraftsmanCert;
  final bool hasOshCert;
  final int? serviceRadiusKm;

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
    this.phoneVisible = false,
    this.availabilityStatus = 'AVAILABLE',
    this.expectedSalaryMin,
    this.expectedSalaryPeriod,
    this.availableFrom,
    this.notifyByEmail = true,
    this.hasProfessionalQualificationCert = false,
    this.hasMasterCraftsmanCert = false,
    this.hasOshCert = false,
    this.serviceRadiusKm,
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
        phoneVisible: json['phoneVisible'] as bool? ?? false,
        availabilityStatus: json['availabilityStatus'] as String? ?? 'AVAILABLE',
        expectedSalaryMin: json['expectedSalaryMin'] as int?,
        expectedSalaryPeriod: json['expectedSalaryPeriod'] as String?,
        availableFrom: json['availableFrom'] as String?,
        notifyByEmail: json['notifyByEmail'] as bool? ?? true,
        hasProfessionalQualificationCert: json['hasProfessionalQualificationCert'] as bool? ?? false,
        hasMasterCraftsmanCert: json['hasMasterCraftsmanCert'] as bool? ?? false,
        hasOshCert: json['hasOshCert'] as bool? ?? false,
        serviceRadiusKm: json['serviceRadiusKm'] as int?,
      );
}