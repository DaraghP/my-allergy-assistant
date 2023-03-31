import cv2
import base64
from fast_deskew import deskew_image

print('Loading ocr-preprocessing function!')

def lambda_handler(event, context):
    image_base64 = event
    image = base64.b64decode(image_base64)

    with open("/tmp/img.jpg", "wb") as f:
         f.write(image)

    cv2_image = cv2.imread("/tmp/img.jpg")

    # apply pre-processing techniques
    grayscaled_image = cv2.cvtColor(cv2_image, cv2.COLOR_BGR2GRAY)
    dilated_image = cv2.dilate(grayscaled_image, (1, 1), iterations=1)
    eroded_image = cv2.erode(dilated_image, (1, 1), iterations=1)
    morph_image = cv2.morphologyEx(eroded_image, cv2.MORPH_CLOSE, (1, 1))
    smoothed_image = cv2.medianBlur(morph_image, 3)
    binarized_image = cv2.adaptiveThreshold(smoothed_image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 10)
    denoised_image = cv2.fastNlMeansDenoising(binarized_image, None, 5, 7, 15)
    rotated_image, angle = deskew_image(denoised_image)

    buffer = cv2.imencode(".jpg", rotated_image)[1]
    return {"isBase64Encoded": True, "headers": {"content-type": "image/jpeg"}, "body": base64.b64encode(buffer)}
