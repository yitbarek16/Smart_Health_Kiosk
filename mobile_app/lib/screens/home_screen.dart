import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'subscription_screen.dart';
import 'kiosk_screen.dart';
import 'history_screen.dart';
import 'appointments_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _subStatus = 'pending';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadStatus();
  }

  Future<void> _loadStatus() async {
    try {
      final meRes = await AuthService.fetchMe();
      setState(() {
        _subStatus = meRes['user']?['subscriptionStatus'] ?? 'pending';
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final patient = AuthService.patient;
    final isActive = _subStatus == 'active';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Smart Health Kiosk'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await AuthService.logout();
              if (mounted) Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const Scaffold(body: Center(child: Text('Logged out')))),
                (route) => false,
              );
            },
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadStatus,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Welcome, ${patient?['name'] ?? 'User'}', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(isActive ? Icons.check_circle : Icons.pending, color: isActive ? Colors.green : Colors.orange, size: 18),
                              const SizedBox(width: 8),
                              Text('Subscription: $_subStatus', style: TextStyle(color: isActive ? Colors.green : Colors.orange, fontWeight: FontWeight.w500)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  if (!isActive) ...[
                    Card(
                      color: Colors.orange.shade50,
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          children: [
                            const Icon(Icons.lock, size: 48, color: Colors.orange),
                            const SizedBox(height: 12),
                            const Text('Subscription Required', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            const Text('Please subscribe to access kiosk features', textAlign: TextAlign.center),
                            const SizedBox(height: 16),
                            FilledButton(
                              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SubscriptionScreen())).then((_) => _loadStatus()),
                              child: const Text('Subscribe Now'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ] else ...[
                    _buildMenuCard(context, Icons.monitor_heart, 'Start Measurement', 'Connect to kiosk and measure vitals', () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const KioskScreen()));
                    }),
                    const SizedBox(height: 12),
                    _buildMenuCard(context, Icons.history, 'Measurement History', 'View past measurements and insights', () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const HistoryScreen()));
                    }),
                    const SizedBox(height: 12),
                    _buildMenuCard(context, Icons.calendar_month, 'My Appointments', 'View appointment status', () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const AppointmentsScreen()));
                    }),
                  ],
                ],
              ),
            ),
    );
  }

  Widget _buildMenuCard(BuildContext context, IconData icon, String title, String subtitle, VoidCallback onTap) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        leading: CircleAvatar(backgroundColor: Theme.of(context).colorScheme.primaryContainer, child: Icon(icon, color: Theme.of(context).colorScheme.primary)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 13)),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
