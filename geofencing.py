import cv2
from config import Config

def is_outside(px, py):
    # pointPolygonTest: คืนค่าลบ = นอกเขต, บวก = ในเขต
    dist = cv2.pointPolygonTest(Config.SAFE_ZONE_POLYGON, (float(px), float(py)), True)
    return dist < -5  # Buffer 5 พิกเซล