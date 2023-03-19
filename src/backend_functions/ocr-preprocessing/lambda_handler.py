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
    binarized_image = cv2.threshold(grayscaled_image, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    denoised_image = cv2.fastNlMeansDenoising(binarized_image, None, 10, 7, 15)
    rotated_image, angle = deskew_image(denoised_image)

    buffer = cv2.imencode(".jpg", rotated_image)[1]
    return {"isBase64Encoded": True, "headers": {"content-type": "image/jpeg"}, "body": base64.b64encode(buffer)}
