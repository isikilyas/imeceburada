class SiteRequest {
  final String id;
  final String createdById;
  final String createdByName;
  final String requestType; // WORKER | EQUIPMENT
  final String? tradeCategory;
  final String? equipmentType;
  final String title;
  final String description;
  final String city;
  final String? district;
  final double latitude;
  final double longitude;
  final int neededCount;
  final String? neededBy;
  final String status; // OPEN | CLOSED
  final String createdAt;
  final int responseCount;

  const SiteRequest({
    required this.id,
    required this.createdById,
    required this.createdByName,
    required this.requestType,
    this.tradeCategory,
    this.equipmentType,
    required this.title,
    required this.description,
    required this.city,
    this.district,
    required this.latitude,
    required this.longitude,
    required this.neededCount,
    this.neededBy,
    required this.status,
    required this.createdAt,
    required this.responseCount,
  });

  factory SiteRequest.fromJson(Map<String, dynamic> json) => SiteRequest(
        id: json['id'] as String,
        createdById: json['createdById'] as String,
        createdByName: json['createdByName'] as String,
        requestType: json['requestType'] as String,
        tradeCategory: json['tradeCategory'] as String?,
        equipmentType: json['equipmentType'] as String?,
        title: json['title'] as String,
        description: json['description'] as String,
        city: json['city'] as String,
        district: json['district'] as String?,
        latitude: (json['latitude'] as num).toDouble(),
        longitude: (json['longitude'] as num).toDouble(),
        neededCount: json['neededCount'] as int,
        neededBy: json['neededBy'] as String?,
        status: json['status'] as String,
        createdAt: json['createdAt'] as String,
        responseCount: json['responseCount'] as int,
      );
}
