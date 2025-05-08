# Gemini OCR Project

This project is a comprehensive OCR (Optical Character Recognition) solution that combines PDF processing, image enhancement, and user interface features. It consists of three main components:

1. PDF OCR service (TypeScript/Node.js)
2. Image processing service (Python)
3. Web UI interface

## Project Structure

```
.
├── pdf-ocr/            # TypeScript-based PDF OCR service
│   ├── src/            # Source code
│   └── ocr_output/     # Output directory for OCR results
├── image_processing/   # Python-based image processing service
│   └── main.py         # Main image processing application
└── ocr-ui/             # Web interface for OCR operations
    ├── src/            # UI source code
    └── public/         # Static assets
```

## Prerequisites

### For PDF OCR Service
- Node.js (Latest LTS version recommended)
- TypeScript
- Google Generative AI API Key

### For Image Processing Service
- Python 3.12 or higher
- UV package manager (recommended for faster dependency installation)

### For OCR UI Service
- Node.js (Latest LTS version recommended)

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

3. Create a `.env` file in the pdf-ocr directory:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```

### OCR UI Service
1. Navigate to the ocr-ui directory:
   ```bash
   cd ocr-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Image Processing Service
1. Install UV package manager:
   ```bash
   pip install uv
   ```

2. Install dependencies using UV:
   ```bash
   uv pip install -r pyproject.toml
   ```

## Running the Services

**Important Notes:**
- Always start the Python image processing service FIRST
- Configure image paths in `pdf-ocr/src/index.ts` before running
- Utilize AI enhancement functions in `src/ai/` for quality improvements

### Image Processing Service
1. Navigate to the image_processing directory:
   ```bash
   cd image_processing
   ```

2. Start the FastAPI service with hot reload:
   ```bash
   uvicorn main:app --reload
   ```
   
   Access at: http://localhost:8000

### PDF OCR Service
1. From the pdf-ocr directory:
   ```bash
   npm start
   ```
   
   Extracted text will be saved in `ocr_output/` as `.txt` files

### OCR UI Service
1. From the ocr-ui directory:
   ```bash
   npm run dev
   ```
   
   Access the UI at: http://localhost:3000

## Features

### PDF OCR Service
- High-quality PDF document processing
- Text extraction with AI enhancements
- Multi-page PDF support
- Structured text output
- Database integration for saving results

### Image Processing Service
- Image quality enhancement
- Resolution upscaling
- Noise reduction algorithms
- FastAPI-based REST API
- Batch processing support

### OCR UI Service
- PDF document upload interface
- Real-time processing status
- Full-text search capabilities
- Results visualization
- Database management interface

## Key Improvements

### Image Quality Enhancements:
- Implemented advanced image preprocessing
- Added resolution upscaling algorithms
- Integrated noise reduction filters

### New Features:
- Database storage for OCR results
- Full-text search functionality
- User-friendly web interface
- Processing status tracking

## Dependencies

### PDF OCR Service
- `@ai-sdk/google` - AI-powered OCR enhancements
- `pdf2pic` - PDF conversion library
- `dotenv` - Environment management

### Image Processing Service
- FastAPI - Web framework
- OpenCV - Image processing
- NumPy - Numerical operations
- Python-multipart - File upload handling

### OCR UI Service
- React - Frontend framework
- Axios - API communication
- Tailwind CSS - Styling
- React-Query