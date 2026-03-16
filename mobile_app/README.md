# Smart Health Kiosk (Flutter)

Mobile app for the Smart Health Kiosk system: connect to Pi sensor kiosk, run hierarchical measurements, view results and AI insights.

## TECNO / physical device (auth setup)

1. **Same WiFi:** Connect the TECNO and your PC to the same Wi‑Fi network.
2. **Backend on PC:** Start the backend (`cd backend && npm start`) and ensure it’s listening on `0.0.0.0` (so the phone can reach it).
3. **API URL:** In `lib/services/auth_service.dart`, `_baseUrl` is set to your PC’s LAN IP (e.g. `http://192.168.137.49:5000/api`). If your PC’s IP changes, update it (run `ipconfig` on Windows and use the IPv4 address of Wi‑Fi).
4. **Run on device:** Connect the phone via USB, enable USB debugging, then:
   ```bash
   flutter devices
   flutter run -d <device-id>
   ```
5. **Sign up / Log in:** In the app, sign up as a patient or log in. Auth uses the backend at the URL above.

To use **Chrome** again, change `_baseUrl` in `auth_service.dart` to `http://localhost:5000/api`.

## Running the app

- **Chrome (web):** `flutter run -d chrome` — API uses `localhost:5000` (backend on same PC).
- **Android device:** Set API URL in `lib/services/auth_service.dart` to your PC's LAN IP, then `flutter run -d <device-id>`.

## Seeing code changes

- **Hot reload (r):** Small UI/state changes only.
- **Hot restart (R):** Use after adding new screens, changing navigation, or when changes don't appear.
- **Full restart:** Stop with `q`, then run `flutter run -d chrome` again.

---

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
