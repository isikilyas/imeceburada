class SupplierProfile {
  final String id;
  final String companyName;
  final String? phone;
  final bool phoneVisible;
  final String city;
  final String? district;
  final String? description;
  final String? authorizedPersonName;
  final String? taxOffice;
  final String? taxNumber;
  final String? mersisNumber;
  final String? website;
  final String? companyEmail;
  final List<String> supplyCategories;
  final String membershipStatus;
  final bool hasActivityCertificate;
  final int? serviceRadiusKm;

  const SupplierProfile({
    required this.id,
    required this.companyName,
    this.phone,
    this.phoneVisible = false,
    required this.city,
    this.district,
    this.description,
    this.authorizedPersonName,
    this.taxOffice,
    this.taxNumber,
    this.mersisNumber,
    this.website,
    this.companyEmail,
    required this.supplyCategories,
    required this.membershipStatus,
    this.hasActivityCertificate = false,
    this.serviceRadiusKm,
  });

  factory SupplierProfile.fromJson(Map<String, dynamic> json) => SupplierProfile(
        id: json['id'] as String,
        companyName: json['companyName'] as String,
        phone: json['phone'] as String?,
        phoneVisible: json['phoneVisible'] as bool? ?? false,
        city: json['city'] as String,
        district: json['district'] as String?,
        description: json['description'] as String?,
        authorizedPersonName: json['authorizedPersonName'] as String?,
        taxOffice: json['taxOffice'] as String?,
        taxNumber: json['taxNumber'] as String?,
        mersisNumber: json['mersisNumber'] as String?,
        website: json['website'] as String?,
        companyEmail: json['companyEmail'] as String?,
        supplyCategories: (json['supplyCategories'] as List?)?.map((e) => e as String).toList() ?? [],
        membershipStatus: json['membershipStatus'] as String? ?? 'NONE',
        hasActivityCertificate: json['hasActivityCertificate'] as bool? ?? false,
        serviceRadiusKm: json['serviceRadiusKm'] as int?,
      );
}
