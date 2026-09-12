class Favorite {
  final String id;
  final String listingType;
  final String listingId;
  final String createdAt;

  const Favorite({
    required this.id,
    required this.listingType,
    required this.listingId,
    required this.createdAt,
  });

  factory Favorite.fromJson(Map<String, dynamic> json) => Favorite(
        id: json['id'] as String,
        listingType: json['listingType'] as String,
        listingId: json['listingId'] as String,
        createdAt: json['createdAt'] as String,
      );
}
