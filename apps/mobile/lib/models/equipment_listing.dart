class EquipmentListing {
  final String id;
  final String ownerId;
  final String ownerName;
  final String? ownerPhone;
  final String equipmentType;
  final String? capacity;
  final String city;
  final String? district;
  final int? dailyRate;
  final int? hourlyRate;
  final String description;
  final String status;
  final String createdAt;

  const EquipmentListing({
    required this.id,
    required this.ownerId,
    required this.ownerName,
    this.ownerPhone,
    required this.equipmentType,
    this.capacity,
    required this.city,
    this.district,
    this.dailyRate,
    this.hourlyRate,
    required this.description,
    required this.status,
    required this.createdAt,
  });

  factory EquipmentListing.fromJson(Map<String, dynamic> json) => EquipmentListing(
        id: json['id'] as String,
        ownerId: json['ownerId'] as String,
        ownerName: json['ownerName'] as String,
        ownerPhone: json['ownerPhone'] as String?,
        equipmentType: json['equipmentType'] as String,
        capacity: json['capacity'] as String?,
        city: json['city'] as String,
        district: json['district'] as String?,
        dailyRate: json['dailyRate'] as int?,
        hourlyRate: json['hourlyRate'] as int?,
        description: json['description'] as String,
        status: json['status'] as String,
        createdAt: json['createdAt'] as String,
      );
}