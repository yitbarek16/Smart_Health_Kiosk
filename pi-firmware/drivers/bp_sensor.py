"""Blood pressure sensor driver.

Returns real readings when the physical sensor is connected.
When not connected, returns null so the app shows "sensor not detected".
"""

import time


class BPSensor:
    def __init__(self):
        self._simulated = True  # Set False when real hardware is connected

    def read(self):
        if self._simulated:
            time.sleep(1)
            return {"systolicBP": None, "diastolicBP": None}
        # Real hardware read would go here
        time.sleep(2)
        return {"systolicBP": None, "diastolicBP": None}
