import { PostProcessingOptions } from "./types.ts";
import FormData from "form-data";
import fetch from "node-fetch";
import fs from "fs/promises"
import path from 'path'

function getPostProcessingPrompt(options: PostProcessingOptions, rawText: string): string {
  // Base prompt for all document types
  let prompt = `
    You are an AI expert in post-processing OCR (Optical Character Recognition) text. 
    Your task is to carefully fix errors in the text while maintaining the original meaning and formatting.

    GUIDELINES:
    1. Fix spelling errors, but preserve intentional spelling in product names, proper nouns, etc.
    2. Fix contextual errors (words that don\'t make sense in context)
    3. Repair formatting issues (e.g., paragraph breaks, list structures)
    4. Keep all original content - don't add or remove information
    5. Preserve special characters, numbers, and technical notation
    6. Maintain the text's original style and tone
    7. Fix OCR-specific errors like '0' vs 'O', 'I' vs 'l', etc.
    8. If you can't be certain about a correction, preserve the original text
    `;

  // Add specialized instructions based on document type
  switch (options.documentType) {
    case "academic":
      prompt += `
        SPECIFIC GUIDELINES FOR ACADEMIC TEXT:
        - Preserve specialized terminology, even if it appears unusual
        - Maintain mathematical formulas and equations
        - Keep citations and references in their original format
        - Pay special attention to superscripts/subscripts that might be misrecognized
        - Preserve special characters common in academic writing (Greek letters, mathematical symbols)
        `;
      break;

    case "technical":
      prompt += `
        SPECIFIC GUIDELINES FOR TECHNICAL DOCUMENTS:
        - Preserve programming code exactly as it appears
        - Maintain technical notation, units, and measurements
        - Pay special attention to numbers, variables, and technical abbreviations
        - Keep consistent indentation in code blocks or technical specifications
        - Preserve technical terms even if they appear to be misspelled
        `;
      break;

    case "legal":
      prompt += `
        SPECIFIC GUIDELINES FOR LEGAL DOCUMENTS:
        - Maintain exact legal terminology, even if unusual
        - Preserve section numbers, article references, and citations
        - Pay special attention to defined terms that may appear to be errors
        - Keep legal formatting conventions (indentation, numbering schemes)
        - Preserve dates, monetary amounts, and party names exactly
        `;
      break;

    case "medical":
      prompt += `
        SPECIFIC GUIDELINES FOR MEDICAL DOCUMENTS:
        - Preserve medical terminology, drug names, and dosages exactly
        - Maintain proper formatting of measurements and units
        - Keep patient data formatting intact (but the data itself is fictional)
        - Pay special attention to medical abbreviations and specialized notation
        - Fix only obvious errors in medical terms while preserving unusual but correct terminology
        `;
      break;

    case "invoice":
      prompt += `
        SPECIFIC GUIDELINES FOR INVOICES:
        - Preserve all numbers and monetary amounts exactly
        - Maintain exact formatting of dates, invoice numbers, and reference codes
        - Keep tables and columnar data properly aligned
        - Pay special attention to product codes, quantities, and pricing
        - Preserve company names, addresses, and contact information exactly
        `;
      break;

    default:
      prompt += `
        SPECIFIC GUIDELINES FOR GENERAL TEXT:
        - Fix common OCR errors while preserving the original meaning
        - Maintain paragraph structure and formatting
        - Preserve proper nouns, names, and specialized terms
        - Pay attention to context to make appropriate corrections
        - Keep lists, bullet points, and enumerations in their original format
        `;
      break;
  }

  // final instructions
  prompt += `
    INPUT TEXT FORMATTING:
    The text I'll provide contains OCR results that may have errors. The text may include:
    - Spelling errors
    - Substitution errors (e.g., '0' instead of 'O')
    - Missing spaces or extra spaces
    - Incorrect paragraph breaks
    - Formatting inconsistencies

    YOUR TASK:
    1. Return only the corrected text
    2. Do not explain your corrections
    3. Do not add comments or annotations
    4. Maintain the original formatting as much as possible
    5. Keep line breaks and paragraph structure

    RETURN FORMAT:
    Return only the corrected text, preserving the original structure.

    THE INPUT TEXT LENGTH IS APPROXIMATELY ${rawText.length} CHARACTERS AND ${rawText.split('\n').length} LINES.
    `;

  return prompt;
}


function getInitialTextExtractionPrompt(documentType: string) {
  let prompt = `
    You are an OCR engine specialized in extracting **plain text in the format of docs (docx) ** from images of documents.
    Your goal is to output the **exact textual content** as faithfully as possible, including:
      - All words and numbers
      - Line breaks and paragraph separations
      - Punctuation, special characters, tables (as plain text)
      - Headers, footers, and any labelling present
    Do **not** interpret meaning, correct errors, or add anything. Just extract what you see.
    `;

  switch (documentType) {
    case "academic":
      prompt += `
        Additional focus for **academic** documents:
          - Preserve equations, Greek letters, superscripts/subscripts
          - Retain citation formatting ("[1]", "(Smith et al., 2020)", etc.)
          - Keep section headings and numbering intact
        `;
      break;

    case "technical":
      prompt += `
        Additional focus for **technical** documents:
          - Extract code blocks with exact indentation and punctuation
          - Preserve units (e.g., "m/s²"), variable names, and mathematical notation
          - Keep bullet lists and tables in plain-text form
        `;
      break;

    case "legal":
      prompt += `
        Additional focus for **legal** documents:
          - Maintain section/article numbering ("Article 5.", "§3.2")
          - Preserve signatures, dates, and defined terms exactly
          - Keep indentation and numbering for clauses
        `;
      break;

    case "medical":
      prompt += `
        Additional focus for **medical** documents:
          - Extract drug names, dosages, and measurements exactly ("5 mg", "mL")
          - Preserve any patient-like tables or charts in plain text
          - Retain medical abbreviations (e.g., "BP", "ECG")
        `;
      break;

    case "invoice":
      prompt += `
        Additional focus for **invoices**:
          - Extract line items as "Item • Qty • Unit Price • Total" rows
          - Preserve invoice numbers, dates, tax IDs exactly
          - Keep table-like data aligned in plain text columns
        `;
      break;
    default:
      prompt += `
        Additional focus for **general** documents:
          - Extract all text, including headers, footers, and any labelling
          - Maintain line breaks and paragraph separations
          - Keep punctuation, special characters, and tables in plain text
        `;
      break;
  }

  return prompt;
} 


async function preprocessImage(buffer: Buffer, preset: string): Promise<Buffer> {
  try {
    const PYTHON_SERVER_URL = 'http:localhost:8000';

    const form = new FormData();
    form.append('file', buffer, { filename: 'image.png', contentType: 'image/png' });
    form.append('preset', preset);

    const res = await fetch(`${PYTHON_SERVER_URL}/preprocess/`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });
    const data = await res.json() as any;

    if (data.error) {
      throw new Error(`Preprocessing error: ${data.error}`);
    }
    const outputBuffer = Buffer.from(data.processed_image, 'base64');

    const dir = path.resolve('./ocr_output/images');
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `processed_${Date.now()}.png`);
    await fs.writeFile(filePath, outputBuffer);

    return outputBuffer
  } catch (err) {
    console.error('[preprocessImage] error:', err);
    // Decide: either rethrow or return the original buffer
    return buffer;
  }
}

export {
  getPostProcessingPrompt,
  getInitialTextExtractionPrompt,
  preprocessImage,
};