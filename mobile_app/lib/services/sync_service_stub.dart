/// Stub used on web (Chrome). MQTT sync runs only on mobile/desktop (sync_service_mobile.dart).
class SyncService {
  SyncService._();
  static final SyncService instance = SyncService._();

  void startBackgroundSync() {}
  void stopSync() {}
  Future<void> bufferMeasurement(Map<String, dynamic> data) async {}
  Future<List<Map<String, dynamic>>> getBufferedMeasurements() async => [];
}
