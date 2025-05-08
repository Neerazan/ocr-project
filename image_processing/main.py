from fastapi import FastAPI, File, UploadFile, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64
import logging
from typing import Optional

app = FastAPI()

# Add CORS middleware to allow requests from your Node.js application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Configure logging
logging.basicConfig(
    level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s'
)


def preprocess_image(image_bytes, preset: str = "text"):
    """
    Preprocess image with different presets optimized for different types of text
    with enhanced quality preservation for better zoom capabilities

    Args:
        image_bytes: Raw image bytes
        preset: Preprocessing preset to use ('text', 'handwriting', 'low_contrast', 'auto')

    Returns:
        Base64 encoded processed image or None on failure
    """
    try:
        # Log the size of received image bytes
        logging.info(f"Processing image of size: {len(image_bytes)} bytes")

        # Decode image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None or img.size == 0:
            logging.error("cv2.imdecode failed to decode the image.")
            return None

        logging.info(
            f"Image decoded successfully. Shape: {img.shape}, dtype: {img.dtype}"
        )

        # Resize while preserving aspect ratio
        # Higher resolution (2000px width) for better quality when zooming
        max_width = 2000
        if img.shape[1] > max_width:
            scale = max_width / img.shape[1]
            resized_img = cv2.resize(
                img,
                (max_width, int(img.shape[0] * scale)),
                interpolation=cv2.INTER_LANCZOS4,
            )  # Better interpolation
            logging.info(f"Image resized to: {resized_img.shape}")
        else:
            # If image is smaller than max_width, upscale it by 1.5x to improve detail preservation
            scale = min(1.5, max_width / img.shape[1])
            if scale > 1.0:
                resized_img = cv2.resize(
                    img,
                    (int(img.shape[1] * scale), int(img.shape[0] * scale)),
                    interpolation=cv2.INTER_LANCZOS4,
                )
                logging.info(
                    f"Image upscaled for better quality. New shape: {resized_img.shape}"
                )
            else:
                resized_img = img.copy()
                logging.info(f"Image kept at original size. Shape: {resized_img.shape}")

        # Convert to grayscale
        gray_img = cv2.cvtColor(resized_img, cv2.COLOR_BGR2GRAY)

        # Apply different processing based on preset
        if preset == "auto":
            # Auto-detect the best processing method based on image analysis
            stddev = np.std(gray_img)
            if stddev < 40:  # Low contrast image
                preset = "low_contrast"
            else:
                preset = "text"
            logging.info(f"Auto-detected preset: {preset} (stddev={stddev:.2f})")

        # Process based on preset
        if preset == "handwriting":
            # Enhanced handwriting processing
            # Non-local means denoising - better preserves details than bilateral filter
            denoised = cv2.fastNlMeansDenoising(gray_img, None, 10, 7, 21)

            # Adaptive histogram equalization with moderate clip limit
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            contrast_enhanced = clahe.apply(denoised)

            # Detail-preserving edge enhancement
            kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]], np.float32)
            processed = cv2.filter2D(contrast_enhanced, -1, kernel)

        elif preset == "low_contrast":
            # Enhanced low contrast processing
            # Apply histogram equalization first to boost overall contrast
            equ = cv2.equalizeHist(gray_img)

            # Then apply CLAHE for local contrast enhancement
            clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(12, 12))
            contrast_enhanced = clahe.apply(equ)

            # Use a larger kernel for adaptive thresholding to better handle varying backgrounds
            processed = cv2.adaptiveThreshold(
                contrast_enhanced,
                255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY,
                21,  # Larger block size
                10,
            )

            # Invert if necessary (more white than black pixels suggests inverted text)
            if np.mean(processed) < 127:
                processed = cv2.bitwise_not(processed)

        else:  # Default "text" preset with quality improvements
            # Enhance details with edge-preserving filtering
            # Use bilateral filter as an alternative to guided filter
            denoised = cv2.bilateralFilter(gray_img, 9, 35, 35)

            # Strong but balanced contrast enhancement
            clahe = cv2.createCLAHE(clipLimit=2.8, tileGridSize=(12, 12))
            contrast_enhanced = clahe.apply(denoised)

            # Apply a moderate sharpening filter
            kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]], np.float32)
            sharpened = cv2.filter2D(contrast_enhanced, -1, kernel)

            # Mix original and sharpened for natural look
            processed = cv2.addWeighted(contrast_enhanced, 0.3, sharpened, 0.7, 0)

        # Ensure we have a 3-channel image for output
        if len(processed.shape) == 2:  # If grayscale
            processed_color = cv2.cvtColor(processed, cv2.COLOR_GRAY2BGR)
        else:
            processed_color = processed

        # Apply unsharp mask for final edge enhancement with better parameters for zoom
        gaussian = cv2.GaussianBlur(processed_color, (0, 0), 2.0)
        final_img = cv2.addWeighted(processed_color, 1.7, gaussian, -0.7, 0)

        # Encode the processed image to base64 with higher quality settings
        encode_params = [
            cv2.IMWRITE_PNG_COMPRESSION,
            0,
        ]  # 0 = no compression for max quality
        _, img_encoded = cv2.imencode('.png', final_img, encode_params)
        processed_image_base64 = base64.b64encode(img_encoded).decode('utf-8')
        logging.info(
            f"Image processed with preset '{preset}', encoded to high quality PNG and Base64."
        )

        return processed_image_base64

    except Exception as e:
        logging.error(f"Error during image processing: {e}")
        import traceback

        logging.error(traceback.format_exc())
        return None


@app.post("/preprocess/")
async def preprocess_endpoint(
    file: UploadFile = File(...),
    preset: Optional[str] = Query(
        "auto", enum=["text", "handwriting", "low_contrast", "auto"]
    ),
):
    """
    Process an uploaded image to optimize it for OCR with enhanced quality for better zooming

    - preset=text: Optimized for printed text (default)
    - preset=handwriting: Optimized for handwritten text
    - preset=low_contrast: Optimized for low contrast images
    - preset=auto: Automatically select the best preset
    """
    try:
        logging.info(
            f"Received file: {file.filename}, content type: {file.content_type}"
        )

        # if not file.content_type.startswith("image/"):
        # logging.warning(f"Received invalid file type: {file.content_type}")
        # return JSONResponse(
        #     status_code=400,
        #     content={"error": "Invalid file type. Only images are allowed."},
        # )

        image_bytes = await file.read()
        logging.info(
            f"Received image file: {file.filename}, size: {len(image_bytes)} bytes, preset: {preset}"
        )

        if len(image_bytes) == 0:
            return JSONResponse(
                status_code=400,
                content={"error": "Empty file received"},
            )

        processed_image = preprocess_image(image_bytes, preset)

        if processed_image:
            # Return metadata about the processing along with the image
            return JSONResponse(
                content={
                    "processed_image": processed_image,
                    "preset_used": preset,
                    "status": "success",
                }
            )
        else:
            return JSONResponse(
                status_code=500, content={"error": "Image processing failed."}
            )
    except Exception as e:
        logging.error(f"Unhandled exception in preprocess_endpoint: {e}")
        import traceback

        logging.error(traceback.format_exc())
        return JSONResponse(
            status_code=500, content={"error": f"Server error: {str(e)}"}
        )


# Add a health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "online"}


# For debugging - Add an info endpoint
@app.get("/info")
async def service_info():
    import sys
    import cv2
    import numpy

    return {
        "python_version": sys.version,
        "opencv_version": cv2.__version__,
        "numpy_version": numpy.__version__,
        "service": "OCR Image Preprocessor",
    }


if __name__ == "__main__":
    import uvicorn

    # Run the server if script is executed directly
    uvicorn.run(app, host="0.0.0.0", port=8000)
