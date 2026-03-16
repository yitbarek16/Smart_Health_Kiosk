"""MLX90614 contactless infrared temperature sensor driver.

Returns real temperature when sensor is connected via I2C.
When not connected, returns null so the app shows "sensor not detected".
"""

import time

try:
    import smbus2
    _HAS_I2C = True
except ImportError:
    _HAS_I2C = False

_ADDR = 0x5A
_OBJ_TEMP_REG = 0x07


class MLX90614:
    def __init__(self, bus_num=1):
        self._bus = None
        self._simulated = not _HAS_I2C
        if _HAS_I2C:
            try:
                self._bus = smbus2.SMBus(bus_num)
                self._bus.read_word_data(_ADDR, _OBJ_TEMP_REG)
            except Exception:
                self._simulated = True

    def read(self):
        if self._simulated:
            time.sleep(0.5)
            return {"temperatureCelsius": None}

        try:
            raw = self._bus.read_word_data(_ADDR, _OBJ_TEMP_REG)
            temp_celsius = round(raw * 0.02 - 273.15, 1)
            return {"temperatureCelsius": temp_celsius}
        except Exception:
            return {"temperatureCelsius": None}
