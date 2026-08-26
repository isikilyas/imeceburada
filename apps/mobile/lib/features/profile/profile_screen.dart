import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/auth_store.dart';
import '../../core/locale_store.dart';
import '../../theme/app_theme.dart';
import '../auth/login_screen.dart';
import '../auth/register_screen.dart';
import '../jobs/my_applications_screen.dart';
import '../jobs/company_jobs_screen.dart';
import '../candidates/candidate_directory_screen.dart';
import '../material_listings/supplier_dashboard_screen.dart';
import '../membership/membership_screen.dart';
import '../subcontractors/subcontractor_dashboard_screen.dart';
import '../subcontractors/subcontractor_directory_screen.dart';
import '../equipment/equipment_mine_screen.dart';
import '../../widgets/language_switcher.dart';
import 'candidate_profile_screen.dart';

const Map<String, String> _roleLabelKeys = {
  'CANDIDATE': 'profile.roleCandidate',
  'COMPANY': 'profile.roleCompany',
  'SUPPLIER': 'profile.roleSupplier',
  'SUBCONTRACTOR': 'profile.roleSubcontractor',
};

/// VKN/belge doğrulama Faz 2'nin sonraki bir adımında eklenecek.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthStore>();
    final user = auth.user;
    final t = context.watch<LocaleStore>().t;

    return Scaffold(
      appBar: AppBar(title: Text(t('profile.title'))),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const LanguageSwitcher(),
            const SizedBox(height: 12),
            if (user == null) ...[
              Text(
                t('profile.loginPrompt'),
                style: const TextStyle(color: AppColors.silver500),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const LoginScreen())),
                child: Text(t('profile.loginButton')),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const RegisterScreen())),
                child: Text(t('profile.registerButton')),
              ),
            ] else ...[
              const Icon(Icons.account_circle,
                  color: AppColors.gold500, size: 64),
              const SizedBox(height: 12),
              Text(user.email,
                  style: const TextStyle(
                      color: AppColors.silver300, fontSize: 16)),
              const SizedBox(height: 4),
              Text(
                _roleLabelKeys[user.role] != null
                    ? t(_roleLabelKeys[user.role]!)
                    : user.role,
                style: const TextStyle(color: AppColors.silver500),
              ),
              const SizedBox(height: 24),
              if (user.role == 'CANDIDATE') ...[
                OutlinedButton(
                  onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const CandidateProfileScreen())),
                  child: Text(t('profile.editProfileButton')),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const MyApplicationsScreen())),
                  child: Text(t('profile.myApplicationsButton')),
                ),
              ],
              if (user.role == 'COMPANY') ...[
                OutlinedButton(
                  onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const CompanyJobsScreen())),
                  child: Text(t('profile.myListingsButton')),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const CandidateDirectoryScreen())),
                  child: Text(t('profile.candidateDirectoryButton')),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const SubcontractorDirectoryScreen())),
                  child: Text(t('profile.subcontractorDirectoryButton')),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const MembershipScreen())),
                  child: Text(t('profile.membershipButton')),
                ),
              ],
              if (user.role == 'SUPPLIER')
                OutlinedButton(
                  onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const SupplierDashboardScreen())),
                  child: Text(t('profile.supplierPanelButton')),
                ),
              if (user.role == 'SUBCONTRACTOR')
                OutlinedButton(
                  onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const SubcontractorDashboardScreen())),
                  child: Text(t('profile.subcontractorPanelButton')),
                ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => const EquipmentMineScreen())),
                child: Text(t('profile.myEquipmentListingsButton')),
              ),
              const SizedBox(height: 16),
              Text(
                t('profile.verificationComingSoon'),
                style:
                    const TextStyle(color: AppColors.silver500, fontSize: 13),
              ),
              const Spacer(),
              TextButton(
                onPressed: () => launchUrl(
                  Uri.parse('https://www.imeceburada.com/privacy'),
                  mode: LaunchMode.externalApplication,
                ),
                child: Text(t('profile.privacyPolicyButton')),
              ),
              const SizedBox(height: 8),
              OutlinedButton(
                onPressed: () => context.read<AuthStore>().logout(),
                child: Text(t('profile.logoutButton')),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
