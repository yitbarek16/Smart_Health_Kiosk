# Smart Health Kiosk IoT System

A distributed IoT healthcare platform for remote areas. Raspberry Pi kiosks with medical sensors connect to a Flutter mobile app over local WiFi. Data syncs to a cloud backend via MQTT (HiveMQ), with AI-powered health insights and hospital recommendations.

## Architecture

```
Pi + Sensors  -->  Mobile App (local WiFi)  -->  HiveMQ (MQTT)  -->  Backend (Node.js)
                   |                                                    |
                   |-- Local Buffer (offline-first)                     |-- MongoDB
                   |-- Subscription gate                                |-- LLM API
                   |-- Appointment flow                                 |-- Google Maps API
                                                                        |
                                                            +-----------+-----------+
                                                            |                       |
                                                  Hospital Dashboard      Super Admin Dashboard
                                                    (WebSocket)              (WebSocket)
```

## Components

| Directory | Description | Tech Stack |
|-----------|-------------|------------|
| `backend/` | REST API + WebSocket + MQTT subscriber | Node.js, Express, MongoDB, Socket.IO |
| `super-admin-dashboard/` | System admin web app | React, Tailwind CSS, Vite |
| `hospital-dashboard/` | Clinical web dashboard | React, Tailwind CSS, Recharts, Vite |
| `mobile_app/` | Patient mobile app | Flutter, Hive, MQTT Client |
| `pi-firmware/` | Raspberry Pi sensor server | Python, Flask, GPIO/I2C drivers |

## Quick Start

### Prerequisites
- Node.js 18+, MongoDB, Python 3.9+, Flutter SDK

### 1. Backend
```bash
cd backend
cp .env .env.local   # Edit with your credentials
npm install
npm run seed          # Creates admin/admin123, sample hospital, kiosk
npm start             # Runs on port 5000
```

### 2. Super Admin Dashboard
```bash
cd super-admin-dashboard
npm install
npm run dev           # Runs on port 3001
# Login: admin / admin123
```

### 3. Hospital Dashboard
```bash
cd hospital-dashboard
npm install
npm run dev           # Runs on port 3002
# Login: doctor1 / doctor123
```

### 4. Mobile App
```bash
cd mobile_app
flutter pub get
flutter run
```

### 5. Pi Firmware (on Raspberry Pi)
```bash
cd pi-firmware
pip install -r requirements.txt
python server.py      # Runs on port 5000
```

## User Flow

1. **Sign Up** - Patient creates account on mobile app
2. **Subscribe** - Pay externally, upload receipt photo
3. **Admin Approves** - Super Admin verifies receipt on dashboard
4. **Measure Vitals** - Connect to kiosk WiFi, guided measurement
5. **AI Analysis** - Backend sends vitals to LLM, gets health insight
6. **Hospital Suggestion** - Google Maps API finds nearby hospitals
7. **Book Appointment** - Select hospital, pay fee, upload receipt
8. **Hospital Approves** - Hospital verifies receipt (no vitals visible yet)
9. **Data Shared** - After approval, hospital sees full patient vitals

## Default Accounts

| Username | Password | Role | Dashboard |
|----------|----------|------|-----------|
| admin | admin123 | Super Admin | Super Admin Dashboard (port 3001) |
| doctor1 | doctor123 | Provider | Hospital Dashboard (port 3002) |
