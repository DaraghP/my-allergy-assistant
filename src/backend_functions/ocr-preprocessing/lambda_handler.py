import base64
from skimage import io
from skimage.transform import rotate
from skimage.color import rgb2gray
from skimage.filters import threshold_otsu
from skimage.restoration import denoise_tv_chambolle
from skimage.exposure import adjust_gamma
from deskew import determine_skew
from numpy import uint8

print('Loading ocr-preprocessing function!')

def lambda_handler(event, context):

    image_base64 = event
    image = base64.b64decode(image_base64)

    with open("/tmp/img.jpg", "wb") as f:
         f.write(image)

    io_image = io.imread("/tmp/img.jpg")

    grayscaled_image = rgb2gray(io_image)
    # threshold = threshold_otsu(grayscaled_image)
    binarized_image = grayscaled_image

    denoised_image = denoise_tv_chambolle(binarized_image)

    rotation_angle = determine_skew(grayscaled_image)
    rotated_image = rotate(denoised_image, rotation_angle, resize=True) * 255

    io.imsave("/tmp/out.jpg", rotated_image.astype(uint8))

    final_image = ""
    with open("/tmp/out.jpg", "rb") as f:
      final_image = base64.b64encode(f.read())
      final_image = final_image.decode("utf-8")

    return {"isBase64Encoded": True, "headers": {"content-type": "image/jpeg"}, "body": final_image}
