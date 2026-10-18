class CompanyProfile {
  final String id;
  final String companyName;
  final String? sector;
  final int? maxSalaryOffer;
  final String city;
  final String? district;
  final String? description;
  final bool phoneVisible;
  final String membershipStatus;
  final String? authorizedPersonName;
  final String? taxOffice;
  final String? taxNumber;
  final String? mersisNumber;
  final String? website;
  final String? companyEmail;
  final bool notifyByEmail;
  final bool hasActivityCertificate;

  const CompanyProfile({
    required this.id,
    required this.companyName,
    this.sector,
    this.maxSalaryOffer,
    required this.city,
    this.district,
    this.description,
    this.phoneVisible = false,
    required this.membershipStatus,
    this.authorizedPersonName,
    this.taxOffice,
    this.taxNumber,
    this.mersisNumber,
    this.website,
    this.companyEmail,
    this.notifyByEmail = true,
    this.hasActivityCertificate = false,
  });

  factory CompanyProfile.fromJson(Map<String, dynamic> json) => CompanyProfile(
        id: json['id'] as String,
        companyName: json['companyName'] as String,
        sector: json['sector'] as String?,
        maxSalaryOffer: json['maxSalaryOffer'] as int?,
        city: json['city'] as String,
        district: json['district'] as String?,
        description: json['description'] as String?,
        phoneVisible: json['phoneVisible'] as bool? ?? false,
        membershipStatus: json['membershipStatus'] as String,
        authorizedPersonName: json['authorizedPersonName'] as String?,
        taxOffice: json['taxOffice'] as String?,
        taxNumber: json['taxNumber'] as String?,
        mersisNumber: json['mersisNumber'] as String?,
        website: json['website'] as String?,
        companyEmail: json['companyEmail'] as String?,
        notifyByEmail: json['notifyByEmail'] as bool? ?? true,
        hasActivityCertificate: json['hasActivityCertificate'] as bool? ?? false,
      );
}
