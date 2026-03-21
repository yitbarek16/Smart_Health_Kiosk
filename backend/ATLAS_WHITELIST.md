# MongoDB Atlas – allow backend to connect

Atlas only allows connections from IPs in the **Network Access** list.

## Option A: Allow from anywhere (easiest for development)

1. Open: **https://cloud.mongodb.com** and sign in.
2. Select your **project** (the one that has Cluster0).
3. In the left sidebar, go to **Security** → **Network Access** (or **Database** → **Network Access**).
4. Click **"+ ADD IP ADDRESS"**.
5. Click **"ALLOW ACCESS FROM ANYWHERE"** (this adds `0.0.0.0/0`).
6. Click **Confirm**.
7. Wait until the new entry shows status **Active** (about 1–2 minutes).

Then start the backend: from the project root run `cd backend && npm start`.

## Option B: Add only your current IP

1. Find your public IP: https://whatismyip.com (or run `curl https://api.ipify.org` if available).
2. In Atlas: **Network Access** → **+ ADD IP ADDRESS**.
3. Enter that IP (e.g. `123.45.67.89`) and add a comment like "PC dev".
4. Confirm and wait until the entry is **Active**.

If your IP changes (e.g. new WiFi), you’ll need to add the new IP or use Option A.
