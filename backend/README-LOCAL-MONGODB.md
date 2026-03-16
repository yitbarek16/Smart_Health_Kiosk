# Local MongoDB (no Atlas, no cloud.mongodb.com)

Use this when you can't reach Atlas (e.g. DNS error like `DNS_PROBE_FINISHED_BAD_CONFIG`).

## Option A: Docker (easiest)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) if you don't have it.
2. In this folder (`backend`), run:
   ```bash
   docker compose up -d
   ```
3. Your `.env` is already set to `MONGODB_URI=mongodb://localhost:27017/smart_health_kiosk`.
4. Start the backend:
   ```bash
   npm start
   ```

## Option B: Install MongoDB Community on Windows

1. Download: https://www.mongodb.com/try/download/community (Windows MSI).
2. Run the installer; use default port **27017**.
3. Ensure MongoDB runs as a service (or start it manually).
4. In `.env` set:
   ```
   MONGODB_URI=mongodb://localhost:27017/smart_health_kiosk
   ```
5. Run `npm start`.

## Switching back to Atlas later

When your DNS works (e.g. after fixing proxy/firewall or using Google DNS 8.8.8.8):

1. In Atlas, add **0.0.0.0/0** under **Network Access** (so your IP can connect).
2. In `.env` set:
   ```
   MONGODB_URI=mongodb+srv://kiosk:kiosk1234@cluster0.ffeckzw.mongodb.net/?appName=Cluster0
   ```
3. Restart the backend.

## Fixing DNS (optional)

If you want to reach cloud.mongodb.com from this PC:

- **Set DNS to Google:** Windows → Settings → Network & Internet → Ethernet/Wi‑Fi → your connection → Edit → set DNS to **8.8.8.8** and **8.8.4.4**, then save.
- **Flush DNS:** Open PowerShell as Administrator and run: `ipconfig /flushdns`.
- **Check proxy:** If you use a VPN or corporate proxy, try disabling it or adding an exception for `*.mongodb.com`.
