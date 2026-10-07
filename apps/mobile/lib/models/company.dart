class CompanyProfile {
  final String id;
  final String companyName;
  final String? sector;
  final String city;
  final String? district;
  final String? description;
  final bool phoneVisible;
  final String membershipStatus;

  const CompanyProfile({
    required this.id,
    required this.companyName,
    this.sector,
    required this.city,
    this.district,
    this.description,
    this.phoneVisible = false,
    required this.membershipStatus,
  });

  factory CompanyProfile.fromJson(Map<String, dynamic> json) => CompanyProfile(
        id: json['id'] as String,
        companyName: json['companyName'] as String,
        sector: json['sector'] as String?,
        city: json['city'] as String,
        district: json['district'] as String?,
        description: json['description'] as String?,
        phoneVisible: json['phoneVisible'] as bool? ?? false,
        membershipStatus: json['membershipStatus'] as String,
      );
}
