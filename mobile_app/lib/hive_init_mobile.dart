import 'dart:io';
import 'package:flutter/services.dart';
import 'package:hive/hive.dart';

Future<void> initHive() async {
  String path;
  try {
    const channel = MethodChannel('plugins.flutter.io/path_provider');
    final String? filesDir =
        await channel.invokeMethod<String>('getApplicationDocumentsDirectory');
    if (filesDir != null && filesDir.isNotEmpty) {
      path = filesDir;
    } else {
      path = _fallbackPath();
    }
  } catch (_) {
    path = _fallbackPath();
  }
  Hive.init(path);
}

String _fallbackPath() {
  const pkg = 'com.smarthealthkiosk.smart_health_kiosk';
  final dir = Directory('/data/data/$pkg/app_flutter');
  if (!dir.existsSync()) dir.createSync(recursive: true);
  return dir.path;
}
