class SubcontractorDirectoryEntry {
  final String id;
  final String companyName;
  final String city;
  final String? district;
  final List<String> tradeCategories;
  final String? description;

  const SubcontractorDirectoryEntry({
    required this.id,
    required this.companyName,
    required this.city,
    this.district,
    required this.tradeCategories,
    this.description,
  });

  factory SubcontractorDirectoryEntry.fromJson(Map<String, dynamic> json) => SubcontractorDirectoryEntry(
        id: json['id'] as String,
        companyName: json['companyName'] as String,
        city: json['city'] as String,
        district: json['district'] as String?,
        tradeCategories: (json['tradeCategories'] as List?)?.map((e) => e as String).toList() ?? [],
        description: json['description'] as String?,
      );
}

class SubcontractorDirectoryDetail extends SubcontractorDirectoryEntry {
  final String? phone;

  const SubcontractorDirectoryDetail({
    required super.id,
    required super.companyName,
    required super.city,
    super.district,
    required super.tradeCategories,
    super.description,
    this.phone,
  });

  factory SubcontractorDirectoryDetail.fromJson(Map<String, dynamic> json) => SubcontractorDirectoryDetail(
        id: json['id'] as String,
        companyName: json['companyName'] as String,
        city: json['city'] as String,
        district: json['district'] as String?,
        tradeCategories: (json['tradeCategories'] as List?)?.map((e) => e as String).toList() ?? [],
        description: json['description'] as String?,
        phone: json['phone'] as String?,
      );
}

class SubcontractorProfile {
  final String id;
  final String companyName;
  final String? phone;
  final String city;
  final String? district;
  final List<String> tradeCategories;
  final String? description;
  final bool isPublic;
  final String membershipStatus;

  const SubcontractorProfile({
    required this.id,
    required this.companyName,
    this.phone,
    required this.city,
    this.district,
    required this.tradeCategories,
    this.description,
    required this.isPublic,
    required this.membershipStatus,
  });

  factory SubcontractorProfile.fromJson(Map<String, dynamic> json) => SubcontractorProfile(
        id: json['id'] as String,
        companyName: json['companyName'] as String,
        phone: json['phone'] as String?,
        city: json['city'] as String,
        district: json['district'] as String?,
        tradeCategories: (json['tradeCategories'] as List?)?.map((e) => e as String).toList() ?? [],
        description: json['description'] as String?,
        isPublic: json['isPublic'] as bool? ?? true,
        membershipStatus: json['membershipStatus'] as String? ?? 'NONE',
      );
}