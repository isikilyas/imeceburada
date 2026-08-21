class MaterialListing {
  final String id;
  final String supplierId;
  final String supplierName;
  final String? supplierPhone;
  final String materialType;
  final String unit;
  final String city;
  final String? district;
  final int price;
  final String description;
  final String status;
  final String createdAt;

  const MaterialListing({
    required this.id,
    required this.supplierId,
    required this.supplierName,
    this.supplierPhone,
    required this.materialType,
    required this.unit,
    required this.city,
    this.district,
    required this.price,
    required this.description,
    required this.status,
    required this.createdAt,
  });

  factory MaterialListing.fromJson(Map<String, dynamic> json) => MaterialListing(
        id: json['id'] as String,
        supplierId: json['supplierId'] as String,
        supplierName: json['supplierName'] as String,
        supplierPhone: json['supplierPhone'] as String?,
        materialType: json['materialType'] as String,
        unit: json['unit'] as String,
        city: json['city'] as String,
        district: json['district'] as String?,
        price: json['price'] as int,
        description: json['description'] as String,
        status: json['status'] as String,
        createdAt: json['createdAt'] as String,
      );
}