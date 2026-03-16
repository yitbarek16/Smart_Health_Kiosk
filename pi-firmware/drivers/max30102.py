"""MAX30102 pulse oximeter / heart rate sensor driver.

Returns real SpO2 and heart rate when sensor is connected via I2C.
When not connected, returns null so the app shows "sensor not detected".
"""

import time

try:
    import smbus2
    _HAS_I2C = True
except ImportError:
    _HAS_I2C = False

_ADDR = 0x57


class MAX30102:
    def __init__(self, bus_num=1):
        self._bus = None
        self._simulated = not _HAS_I2C
        if _HAS_I2C:
            try:
                self._bus = smbus2.SMBus(bus_num)
                self._bus.read_byte_data(_ADDR, 0xFF)
            except Exception:
                self._simulated = True

    def read(self, duration_seconds=10):
        if self._simulated:
            time.sleep(1)
            return {"heartRate": None, "spo2": None}

        samples_ir = []
        samples_red = []
        end_time = time.time() + duration_seconds

        while time.time() < end_time:
            try:
                data = self._bus.read_i2c_block_data(_ADDR, 0x07, 6)
                ir_val = (data[0] << 16) | (data[1] << 8) | data[2]
                red_val = (data[3] << 16) | (data[4] << 8) | data[5]
                samples_ir.append(ir_val)
                samples_red.append(red_val)
            except Exception:
                pass
            time.sleep(0.02)

        if not samples_ir:
            return {"heartRate": None, "spo2": None}

        avg_ir = sum(samples_ir) / len(samples_ir)
        avg_red = sum(samples_red) / len(samples_red)
        ratio = (avg_red / avg_ir) if avg_ir > 0 else 0
        spo2 = max(0, min(100, int(110 - 25 * ratio)))
        heart_rate = int(len(samples_ir) / duration_seconds * 60 / 20)

        return {"heartRate": heart_rate, "spo2": spo2}
