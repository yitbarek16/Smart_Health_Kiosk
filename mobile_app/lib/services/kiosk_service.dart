import 'dart:convert';
import 'package:http/http.dart' as http;

class KioskService {
  String? _kioskIp;
  String? _kioskId;

  String? get kioskId => _kioskId;
  bool get isConnected => _kioskIp != null;

  Future<bool> connect(String kioskIp) async {
    final trimmed = kioskIp.trim();
    if (trimmed.isEmpty) return false;
    try {
      final uri = Uri.parse('http://$trimmed:5000/status');
      final res = await http.get(uri).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        _kioskIp = trimmed;
        _kioskId = data['kioskId'] as String?;
        return true;
      }
      return false;
    } catch (e) {
      _lastError = e.toString().replaceFirst('Exception: ', '').replaceFirst('TimeoutException: ', '');
      return false;
    }
  }

  String? _lastError;
  String? get lastError => _lastError;

  void disconnect() {
    _kioskIp = null;
    _kioskId = null;
    _lastError = null;
  }

  Future<Map<String, dynamic>?> startMeasurement(String sensorType) async {
    if (_kioskIp == null) return null;
    try {
      final res = await http.post(
        Uri.parse('http://$_kioskIp:5000/measure'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'sensor': sensorType}),
      ).timeout(const Duration(seconds: 60));
      if (res.statusCode == 200) return jsonDecode(res.body);
    } catch (_) {}
    return null;
  }

  Future<Map<String, dynamic>?> measureAll() async {
    if (_kioskIp == null) return null;
    try {
      final res = await http.post(
        Uri.parse('http://$_kioskIp:5000/measure/all'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 120));
      if (res.statusCode == 200) return jsonDecode(res.body);
    } catch (_) {}
    return null;
  }
}
