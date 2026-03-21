"""Smart Health Kiosk - Raspberry Pi Sensor Server.

Exposes a REST API on the local WiFi network for the mobile app
to connect, trigger measurements, and receive vital sign data.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

from config import KIOSK_ID, SERVER_HOST, SERVER_PORT
from drivers.max30102 import MAX30102
from drivers.mlx90614 import MLX90614
from drivers.weight_sensor import WeightSensor
from drivers.hcsr04 import HCSR04
from drivers.bp_sensor import BPSensor

app = Flask(__name__)
# Allow browser (Chrome) and mobile app to call the Pi from another origin
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"]}})

pulse_ox = MAX30102()
temp_sensor = MLX90614()
weight_sensor = WeightSensor()
height_sensor = HCSR04()
bp_sensor = BPSensor()


@app.route("/status", methods=["GET"])
def status():
    return jsonify({
        "kioskId": KIOSK_ID,
        "status": "online",
        "timestamp": datetime.utcnow().isoformat(),
        "sensors": ["bp", "spo2_hr", "temperature", "weight", "height"],
    })


@app.route("/measure", methods=["POST"])
def measure_single():
    data = request.get_json() or {}
    sensor_type = data.get("sensor", "")

    handlers = {
        "bp": lambda: bp_sensor.read(),
        "spo2_hr": lambda: pulse_ox.read(),
        "temperature": lambda: temp_sensor.read(),
        "weight": lambda: weight_sensor.read(),
        "height": lambda: height_sensor.read(),
    }

    handler = handlers.get(sensor_type)
    if not handler:
        return jsonify({"error": f"Unknown sensor: {sensor_type}"}), 400

    result = handler()
    return jsonify({"sensor": sensor_type, "data": result, "timestamp": datetime.utcnow().isoformat()})


@app.route("/measure/all", methods=["POST"])
def measure_all():
    bp_data = bp_sensor.read()
    ox_data = pulse_ox.read()
    temp_data = temp_sensor.read()
    weight_data = weight_sensor.read()
    height_data = height_sensor.read()

    vitals = {**bp_data, **ox_data, **temp_data, **weight_data, **height_data}

    weight_kg = vitals.get("weightKg")
    height_cm = vitals.get("heightCm")
    if weight_kg and height_cm and height_cm > 0:
        height_m = height_cm / 100
        vitals["bmi"] = round(weight_kg / (height_m ** 2), 1)

    systolic = vitals.get("systolicBP")
    diastolic = vitals.get("diastolicBP")
    if systolic and diastolic:
        vitals["meanArterialPressure"] = round(diastolic + (systolic - diastolic) / 3, 1)

    return jsonify({
        "kioskId": KIOSK_ID,
        "vitals": vitals,
        "measuredAt": datetime.utcnow().isoformat(),
    })


if __name__ == "__main__":
    print(f"Kiosk {KIOSK_ID} sensor server starting on {SERVER_HOST}:{SERVER_PORT}")
    app.run(host=SERVER_HOST, port=SERVER_PORT, debug=False)
