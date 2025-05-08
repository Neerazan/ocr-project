import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import fs from "fs/promises";

async function fixSpecializedOCR(
  text: string,
  documentType: "code" | "math" | "table" | "invoice" | "form" | "general" = "general",
  modelName: string = "gemini-2.0-flash-001"
): Promise<string> {
  try {
    const model = google(modelName);

    // Create specialized prompt based on document type
    let specializedPrompt = `You are an expert in fixing OCR errors in ${documentType} documents.`;

    switch (documentType) {
      case "code":
        specializedPrompt += `
          Focus on:
          - Fixing programming syntax errors while maintaining the code's logic
          - Correcting variable names consistently throughout the code
          - Fixing indentation and code structure
          - Preserving programming language-specific syntax
          - Correcting common OCR errors in code (e.g., '0' vs 'O', '1' vs 'l')`;
        break;

      case "math":
        specializedPrompt += `
          Focus on:
          - Fixing mathematical notation and symbols
          - Correcting equation formatting
          - Ensuring proper superscripts and subscripts
          - Preserving mathematical operators and special characters
          - Maintaining the logical structure of formulas`;
        break;

      case "table":
        specializedPrompt += `
          Focus on:
          - Fixing table structure and alignment
          - Correcting cell content while maintaining the table format
          - Preserving column and row relationships
          - Fixing headers and labels
          - Maintaining numerical precision in table cells`;
        break;

      case "invoice":
        specializedPrompt += `
          Focus on:
          - Fixing company names, addresses, and contact information
          - Correcting invoice numbers, dates, and reference codes
          - Preserving monetary amounts and calculations
          - Fixing product descriptions and line items
          - Maintaining the original layout of the invoice`;
        break;

      case "form":
        specializedPrompt += `
          Focus on:
          - Preserving form field labels and content
          - Fixing field values while maintaining their association with labels
          - Correcting checkbox and selection indicators
          - Preserving form structure and layout
          - Maintaining proper formatting of form data`;
        break;

      default: // "general"
        specializedPrompt += `
          Focus on:
          - Fixing spelling and grammatical errors
          - Correcting contextual inconsistencies
          - Preserving paragraph structure and formatting
          - Fixing punctuation and capitalization
          - Maintaining the original meaning and tone`;
    }

    specializedPrompt += `
      Please correct the following text from an OCR system. Return only the corrected text without explanations.
      Here is the text to fix: ${text}`;

    const result = await generateText({
      model,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: specializedPrompt }],
        },
      ],
      temperature: 0.1,
      topP: 0.95,
      maxTokens: Math.max(text.length * 2, 1024),
    });

    fs.writeFile("ocr_output/ocr_specialized_fixed.txt", result.text, "utf-8");
    return result.text;
  } catch (error) {
    console.error(`Error fixing specialized OCR (${documentType}):`, error);
    return text;
  }
}


export default fixSpecializedOCR;