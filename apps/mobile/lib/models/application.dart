class JobApplication {
  final String id;
  final String jobId;
  final String jobTitle;
  // Başvuran aday mı (CANDIDATE) yoksa taşeron firma mı (SUBCONTRACTOR) — bkz.
  // apps/api ApplicationDto. API eskiden sadece adayları destekliyordu ve bu
  // alanlar candidateId/candidateName idi; taşeron firma başvuruları eklenince
  // applicantType/applicantId/applicantName olarak genelleştirildi.
  final String applicantType;
  final String applicantId;
  final String applicantName;
  final String status; // PENDING | REVIEWED | ACCEPTED | REJECTED
  final String createdAt;

  const JobApplication({
    required this.id,
    required this.jobId,
    required this.jobTitle,
    required this.applicantType,
    required this.applicantId,
    required this.applicantName,
    required this.status,
    required this.createdAt,
  });

  factory JobApplication.fromJson(Map<String, dynamic> json) => JobApplication(
        id: json['id'] as String,
        jobId: json['jobId'] as String,
        jobTitle: json['jobTitle'] as String,
        applicantType: json['applicantType'] as String,
        applicantId: json['applicantId'] as String,
        applicantName: json['applicantName'] as String,
        status: json['status'] as String,
        createdAt: json['createdAt'] as String,
      );
}

const Map<String, String> applicationStatusLabels = {
  'PENDING': 'Beklemede',
  'REVIEWED': 'İncelendi',
  'ACCEPTED': 'Kabul Edildi',
  'REJECTED': 'Reddedildi',
};