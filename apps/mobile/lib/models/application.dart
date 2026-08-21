class JobApplication {
  final String id;
  final String jobId;
  final String jobTitle;
  final String candidateId;
  final String candidateName;
  final String status; // PENDING | REVIEWED | ACCEPTED | REJECTED
  final String createdAt;

  const JobApplication({
    required this.id,
    required this.jobId,
    required this.jobTitle,
    required this.candidateId,
    required this.candidateName,
    required this.status,
    required this.createdAt,
  });

  factory JobApplication.fromJson(Map<String, dynamic> json) => JobApplication(
        id: json['id'] as String,
        jobId: json['jobId'] as String,
        jobTitle: json['jobTitle'] as String,
        candidateId: json['candidateId'] as String,
        candidateName: json['candidateName'] as String,
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