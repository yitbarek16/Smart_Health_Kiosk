import 'dart:async';
import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:hive/hive.dart';
import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client/mqtt_server_client.dart';
import 'auth_service.dart';

/// HiveMQ Cloud broker (same as backend) so messages appear in your HiveMQ portal.
const String _mqttHost = '84e4d91503b8448c949f53403c4ce0b9.s1.eu.hivemq.cloud';
const int _mqttPort = 8883;
const String _mqttUsername = 'kiosk';
const String _mqttPassword = '@Kiosk123';

class SyncService {
  SyncService._();
  static final SyncService instance = SyncService._();

  MqttServerClient? _mqttClient;
  Timer? _syncTimer;

  void startBackgroundSync() {
    _syncTimer?.cancel();
    _syncTimer = Timer.periodic(const Duration(seconds: 30), (_) => _trySync());
    _trySync();
  }

  void stopSync() {
    _syncTimer?.cancel();
    _mqttClient?.disconnect();
  }

  Future<void> bufferMeasurement(Map<String, dynamic> data) async {
    final box = Hive.box('measurements');
    final id = DateTime.now().millisecondsSinceEpoch.toString();
    await box.put(id, jsonEncode({...data, 'syncStatus': 'buffered', 'bufferId': id}));
  }

  /// Returns buffered (not yet synced) measurements for display in History.
  Future<List<Map<String, dynamic>>> getBufferedMeasurements() async {
    final box = Hive.box('measurements');
    final list = <Map<String, dynamic>>[];
    for (final key in box.keys) {
      final raw = box.get(key);
      if (raw == null) continue;
      final data = jsonDecode(raw as String) as Map<String, dynamic>;
      if (data['syncStatus'] == 'synced') continue;
      list.add(data);
    }
    list.sort((a, b) => (b['measuredAt'] as String? ?? '').compareTo(a['measuredAt'] as String? ?? ''));
    return list;
  }

  Future<void> _trySync() async {
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity.contains(ConnectivityResult.none)) return;

    final box = Hive.box('measurements');
    if (box.isEmpty) return;

    await _ensureMqttConnected();
    if (_mqttClient == null || _mqttClient!.connectionStatus?.state != MqttConnectionState.connected) return;

    final keys = box.keys.toList();
    for (final key in keys) {
      try {
        final raw = box.get(key);
        if (raw == null) continue;
        final data = jsonDecode(raw as String) as Map<String, dynamic>;
        if (data['syncStatus'] == 'synced') continue;

        final kioskId = data['kioskId'] ?? 'unknown';
        final patientId = AuthService.patient?['_id'] ?? 'unknown';
        final topic = 'kiosk/$kioskId/patient/$patientId/vitals';

        final builder = MqttClientPayloadBuilder();
        builder.addString(jsonEncode({
          'vitals': data['vitals'],
          'measuredAt': data['measuredAt'],
        }));

        _mqttClient!.publishMessage(topic, MqttQos.atLeastOnce, builder.payload!);

        data['syncStatus'] = 'synced';
        await box.put(key, jsonEncode(data));
      } catch (_) {}
    }
  }

  Future<void> _ensureMqttConnected() async {
    if (_mqttClient?.connectionStatus?.state == MqttConnectionState.connected) return;

    _mqttClient = MqttServerClient(
      _mqttHost,
      'flutter_${DateTime.now().millisecondsSinceEpoch}',
    );
    _mqttClient!.port = _mqttPort;
    _mqttClient!.secure = true;
    _mqttClient!.keepAlivePeriod = 60;
    _mqttClient!.logging(on: false);
    _mqttClient!.autoReconnect = true;

    try {
      await _mqttClient!.connect(_mqttUsername, _mqttPassword);
    } catch (_) {
      _mqttClient = null;
    }
  }
}
