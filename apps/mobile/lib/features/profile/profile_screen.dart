import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/auth_store.dart';
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

const Map<String, String> _roleLabels = {
  'CANDIDATE': 'İş Arayan Personel Hesabı',
  'COMPANY': 'Firma Hesabı',
  'SUPPLIER': 'Yapı Tedarik Hesabı',
  'SUBCONTRACTOR': 'Taşeron Firma Hesabı',
};

/// VKN/belge doğrulama Faz 2'nin sonraki bir adımında eklenecek.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthStore>();
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(title: const Text('Profil')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const LanguageSwitcher(),
            const SizedBox(height: 12),
            if (user == null) ...[
              const Text(
                'Profilini görmek, ilan/çağrı vermek ve piyasa verisine katkı sunmak için giriş yapmalısın.',
                style: TextStyle(color: AppColors.silver500),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen())),
                child: const Text('Giriş Yap'),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () =>
                    Navigator.of(context).push(MaterialPageRoute(builder: (_) => const RegisterScreen())),
                child: const Text('Kayıt Ol'),
              ),
            ] else ...[
              const Icon(Icons.account_circle, color: AppColors.gold500, size: 64),
              const SizedBox(height: 12),
              Text(user.email, style: const TextStyle(color: AppColors.silver300, fontSize: 16)),
              const SizedBox(height: 4),
              Text(_roleLabels[user.role] ?? user.role, style: const TextStyle(color: AppColors.silver500)),
              const SizedBox(height: 24),
              if (user.role == 'CANDIDATE') ...[
                OutlinedButton(
                  onPressed: () => Navigator.of(context)
                      .push(MaterialPageRoute(builder: (_) => const CandidateProfileScreen())),
                  child: const Text('Profilimi Düzenle'),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () => Navigator.of(context)
                      .push(MaterialPageRoute(builder: (_) => const MyApplicationsScreen())),
                  child: const Text('Başvurularım'),
                ),
              ],
              if (user.role == 'COMPANY') ...[
                OutlinedButton(
                  onPressed: () =>
                      Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CompanyJobsScreen())),
                  child: const Text('İlanlarım'),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () => Navigator.of(context)
                      .push(MaterialPageRoute(builder: (_) => const CandidateDirectoryScreen())),
                  child: const Text('Usta / Aday Dizini'),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () => Navigator.of(context)
                      .push(MaterialPageRoute(builder: (_) => const SubcontractorDirectoryScreen())),
                  child: const Text('Taşeron Firma Dizini'),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () =>
                      Navigator.of(context).push(MaterialPageRoute(builder: (_) => const MembershipScreen())),
                  child: const Text('Üyelik'),
                ),
              ],
              if (user.role == 'SUPPLIER')
                OutlinedButton(
                  onPressed: () => Navigator.of(context)
                      .push(MaterialPageRoute(builder: (_) => const SupplierDashboardScreen())),
                  child: const Text('Yapı Tedarik Paneli'),
                ),
              if (user.role == 'SUBCONTRACTOR')
                OutlinedButton(
                  onPressed: () => Navigator.of(context)
                      .push(MaterialPageRoute(builder: (_) => const SubcontractorDashboardScreen())),
                  child: const Text('Taşeron Firma Panelim'),
                ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () =>
                    Navigator.of(context).push(MaterialPageRoute(builder: (_) => const EquipmentMineScreen())),
                child: const Text('Ekipman İlanlarım'),
              ),
              const SizedBox(height: 16),
              const Text(
                'VKN / Ticaret Sicili doğrulama bir sonraki adımda eklenecek.',
                style: TextStyle(color: AppColors.silver500, fontSize: 13),
              ),
              const Spacer(),
              OutlinedButton(
                onPressed: () => context.read<AuthStore>().logout(),
                child: const Text('Çıkış Yap'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}