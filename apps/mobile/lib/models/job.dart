class JobPosting {
  final String id;
  final String companyId;
  final String companyName;
  final String title;
  final String listingType;
  final String tradeCategory;
  final String city;
  final String? district;
  final String employmentType;
  final int? salaryMin;
  final int? salaryMax;
  final String description;
  final String status;
  final String createdAt;

  const JobPosting({
    required this.id,
    required this.companyId,
    required this.companyName,
    required this.title,
    required this.listingType,
    required this.tradeCategory,
    required this.city,
    this.district,
    required this.employmentType,
    this.salaryMin,
    this.salaryMax,
    required this.description,
    required this.status,
    required this.createdAt,
  });

  factory JobPosting.fromJson(Map<String, dynamic> json) => JobPosting(
        id: json['id'] as String,
        companyId: json['companyId'] as String,
        companyName: json['companyName'] as String,
        title: json['title'] as String,
        listingType: json['listingType'] as String? ?? 'PERSONNEL',
        tradeCategory: json['tradeCategory'] as String,
        city: json['city'] as String,
        district: json['district'] as String?,
        employmentType: json['employmentType'] as String,
        salaryMin: json['salaryMin'] as int?,
        salaryMax: json['salaryMax'] as int?,
        description: json['description'] as String,
        status: json['status'] as String,
        createdAt: json['createdAt'] as String,
      );
}