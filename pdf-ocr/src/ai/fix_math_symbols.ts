import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import fs from "fs/promises";

async function fixMathSymbols(text: string): Promise<string> {
  try {
    const model = google("gemini-2.0-flash-001");

    const prompt = `You are an expert in mathematical notation and LaTeX formatting. Please fix the following text by:
    1. Replacing text representations of Greek letters with their proper symbols (e.g., "lambda" → "λ")
    2. Ensuring proper LaTeX formatting for mathematical expressions
    3. Maintaining the exact mathematical meaning and structure
    4. Preserving all other text and formatting

    Here is the text to fix:
    ${text}

    Return only the corrected text without any explanations.`;

    const result = await generateText({
      model,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }],
        },
      ],
      temperature: 0.1,
      topP: 0.95,
      maxTokens: Math.max(text.length * 2, 1024),
    });

    await fs.writeFile("ocr_output/ocr_math_fixed.txt", result.text, "utf-8");
    return result.text;
  } catch (error) {
    console.error("Error fixing mathematical symbols:", error);
    return text;
  }
}

export default fixMathSymbols; 