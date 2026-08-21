class IndexPoint {
  final String month;
  final String category;
  final String city;
  final String? unit;
  final num averageAmount;
  final num medianAmount;
  final int sampleSize;
  final num? expectationAverage;
  final int expectationSampleSize;

  const IndexPoint({
    required this.month,
    required this.category,
    required this.city,
    this.unit,
    required this.averageAmount,
    required this.medianAmount,
    required this.sampleSize,
    this.expectationAverage,
    this.expectationSampleSize = 0,
  });

  factory IndexPoint.fromWageJson(Map<String, dynamic> json) => IndexPoint(
        month: json['month'] as String,
        category: json['tradeCategory'] as String,
        city: json['city'] as String,
        averageAmount: json['averageAmount'] as num,
        medianAmount: json['medianAmount'] as num,
        sampleSize: json['sampleSize'] as int,
        expectationAverage: json['expectationAverage'] as num?,
        expectationSampleSize: json['expectationSampleSize'] as int? ?? 0,
      );

  factory IndexPoint.fromMaterialJson(Map<String, dynamic> json) => IndexPoint(
        month: json['month'] as String,
        category: json['materialType'] as String,
        city: json['city'] as String,
        unit: json['unit'] as String?,
        averageAmount: json['averageAmount'] as num,
        medianAmount: json['medianAmount'] as num,
        sampleSize: json['sampleSize'] as int,
        expectationAverage: json['expectationAverage'] as num?,
        expectationSampleSize: json['expectationSampleSize'] as int? ?? 0,
      );
}
