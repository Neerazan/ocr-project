# Gemini OCR Project

This project is a comprehensive OCR (Optical Character Recognition) solution that combines both PDF and image processing capabilities. It consists of two main components: a PDF OCR service built with TypeScript/Node.js and an image processing service built with Python.

## Project Structure

```
.
├── pdf-ocr/           # TypeScript-based PDF OCR service
│   ├── src/          # Source code
│   └── ocr_output/   # Output directory for OCR results
└── image_processing/ # Python-based image processing service
    └── main.py       # Main image processing application
----ocr-ui
```

## Prerequisites

### For PDF OCR Service
- Node.js (Latest LTS version recommended)
- TypeScript
- Google Generative AI API KEY
### For Image Processing Service
- Python 3.12 or higher
- UV package manager (recommended for faster dependency installation)

## Installation

### PDF OCR Service

1. Navigate to the pdf-ocr directory:
```bash
cd pdf-ocr
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the pdf-ocr directory and add your Google Cloud Vision API credentials:
```
GOOGLE_GENERATIVE_AI_API_KEY=
```

### ocr ui service
1. Navigate to the ocr-ui directory:
```bash
cd ocr-ui
```

2. Install dependencies:
```bash
npm install
```

### Image Processing Service

1. Install UV package manager (if not already installed):
```bash
pip install uv
```

2. Install dependencies using UV:
```bash
uv pip install -r pyproject.toml
```

## Running the Services

### Important Notes
**IMPORTANT**: 
- Always start the Python image processing service BEFORE running the PDF OCR service
- Make sure to configure the image path in `pdf-ocr/src/index.ts` before running the OCR service
  - You can use either a local image path or an image URL
  - Example: `const imagePath = './path/to/your/image.jpg'` or `const imagePath = 'https://example.com/image.jpg'`
- There are multiple utility functions available inside the `src/ai` directory of the PDF OCR service. These functions are primarily responsible for handling AI-powered OCR enhancements.
### Image Processing Service

1. Navigate to the image_processing directory:
```bash
cd image_processing
```

2. Start the FastAPI service with hot reload:
```bash
uvicorn main:app --reload
```

The service will be available at `http://localhost:8000`

### PDF OCR Service

After running the PDF OCR service successfully, the extracted text will be saved inside the `ocr_output` folder as a `.txt` file. You can view the results there.

To start the PDF OCR service:
```bash
cd pdf-ocr
npm start
```

## Features

### PDF OCR Service
- PDF document processing
- Text extraction using Google Cloud Vision API
- Support for various PDF formats
- Output in structured format

### Image Processing Service
- Image processing capabilities
- FastAPI-based REST API
- Support for various image formats
- Real-time image processing

### OCR UI service
- upload pdf document
- search text
- see document status

## Dependencies

### PDF OCR Service
- @ai-sdk/google

- dotenv

### Image Processing Service
- FastAPI
- OpenCV
- NumPy
- Python-multipart
- UV package manager