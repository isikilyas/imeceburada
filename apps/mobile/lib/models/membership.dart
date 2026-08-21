class CompanyMembership {
  final String status;
  final String? plan;
  final String? expiresAt;
  final bool phoneVerified;

  const CompanyMembership({
    required this.status,
    this.plan,
    this.expiresAt,
    required this.phoneVerified,
  });

  factory CompanyMembership.fromJson(Map<String, dynamic> json) => CompanyMembership(
        status: json['status'] as String,
        plan: json['plan'] as String?,
        expiresAt: json['expiresAt'] as String?,
        phoneVerified: json['phoneVerified'] as bool,
      );
}

class MembershipPlanInfo {
  final String plan;
  final String label;
  final String priceLabel;

  const MembershipPlanInfo({required this.plan, required this.label, required this.priceLabel});

  factory MembershipPlanInfo.fromJson(Map<String, dynamic> json) => MembershipPlanInfo(
        plan: json['plan'] as String,
        label: json['label'] as String,
        priceLabel: json['priceLabel'] as String,
      );
}

class CheckoutResult {
  final String checkoutFormContent;
  final String token;

  const CheckoutResult({required this.checkoutFormContent, required this.token});

  factory CheckoutResult.fromJson(Map<String, dynamic> json) => CheckoutResult(
        checkoutFormContent: json['checkoutFormContent'] as String,
        token: json['token'] as String,
      );
}