import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  // On phone: use your Linux PC's IP so the app can reach the backend (same WiFi).
  // Find PC IP: hostname -I | awk '{print $1}' (e.g. 192.168.1.105). USB tethering: 192.168.137.1
  // Chrome/web: use http://localhost:5000/api
  static const String _baseUrl = 'http://192.168.1.100:5000/api';
  static String? _token;
  static Map<String, dynamic>? _patient;

  static Future<String?> getToken() async {
    if (_token != null) return _token;
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    final patientJson = prefs.getString('patient');
    if (patientJson != null) _patient = jsonDecode(patientJson);
    return _token;
  }

  static Map<String, dynamic>? get patient => _patient;
  static String get baseUrl => _baseUrl;

  static Map<String, String> get headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  static Future<Map<String, dynamic>> signup({
    required String name,
    required String phone,
    required String password,
    double? latitude,
    double? longitude,
  }) async {
    final res = await http.post(
      Uri.parse('$_baseUrl/auth/patient/signup'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        'phone': phone,
        'password': password,
        'latitude': latitude ?? 0,
        'longitude': longitude ?? 0,
      }),
    );
    final data = jsonDecode(res.body);
    if (res.statusCode == 201) {
      await _saveAuth(data['token'], data['patient']);
    }
    return data;
  }

  static Future<Map<String, dynamic>> login({
    required String phone,
    required String password,
  }) async {
    final res = await http.post(
      Uri.parse('$_baseUrl/auth/patient/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone, 'password': password}),
    );
    final data = jsonDecode(res.body);
    if (res.statusCode == 200) {
      await _saveAuth(data['token'], data['patient']);
    }
    return data;
  }

  static Future<void> _saveAuth(String token, Map<String, dynamic> patient) async {
    _token = token;
    _patient = patient;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    await prefs.setString('patient', jsonEncode(patient));
  }

  static Future<void> logout() async {
    _token = null;
    _patient = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('patient');
  }

  static Future<Map<String, dynamic>> fetchMe() async {
    final res = await http.get(
      Uri.parse('$_baseUrl/auth/me'),
      headers: headers,
    );
    final data = jsonDecode(res.body);
    if (res.statusCode == 200) {
      _patient = data['user'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('patient', jsonEncode(_patient));
    }
    return data;
  }
}
