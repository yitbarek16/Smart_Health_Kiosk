# Raspberry Pi 5 GPIO setup (rpi-lgpio)

On Pi 5, **RPi.GPIO** fails with "Cannot determine SOC peripheral base address". Use **rpi-lgpio** instead. The pip package **rpi-lgpio** depends on **lgpio**, which often fails to build in a venv because the system C library `liblgpio` is missing. Use one of the following.

## Option A: Use system lgpio (recommended)

Install the system package and create a venv that can see it:

```bash
sudo apt update
sudo apt install -y python3-lgpio
cd ~/pi-firmware
rm -rf venv
python3 -m venv --system-site-packages venv
source venv/bin/activate
pip install -r requirements.txt
python test_ultrasonic.py
```

Do **not** install RPi.GPIO in this venv; requirements.txt uses rpi-lgpio only.

## Option B: Build lgpio in venv (if you have liblgpio)

If your distro provides the C library (e.g. `liblgpio-dev` or `lgpio-dev`):

```bash
sudo apt install -y liblgpio-dev   # or whatever provides liblgpio
cd ~/pi-firmware
source venv/bin/activate
pip install lgpio
pip install -r requirements.txt
```

If **lgpio** still fails to build, use Option A.
