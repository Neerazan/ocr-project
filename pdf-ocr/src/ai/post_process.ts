import { PostProcessingOptions } from "../types.ts";
import { DEFAULT_POST_PROCESSING_OPTIONS } from "../constants.ts";
import { getPostProcessingPrompt } from "../utils.ts";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import fs from "fs/promises";

async function postProcessOCRText(
  rawText: string,
  options: PostProcessingOptions = DEFAULT_POST_PROCESSING_OPTIONS
): Promise<string> {
  try {
    if (rawText.length < 20) {
      if (options.verbose) console.log("Text too short, skipping post-processing");
      return rawText;
    }

    const model = google(options.modelName || "gemini-1.5-pro-latest");
    const systemPrompt = getPostProcessingPrompt(options, rawText);

    if (options.verbose) {
      console.log("Starting AI post-processing of OCR text");
      console.log(`Raw text length: ${rawText.length} characters`);
    }

    let userPrompt = `Here is the OCR text that needs correction. Please fix any errors like (spelling mistake, extra words, modify or remove word if it is out of context and many more) while maintaining the original meaning and formatting:
    ${rawText}`;

    const improvedResult = await generateText({
      model,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt }
          ],
        },
      ],
      temperature: 0.1, // Low temperature for more deterministic corrections
      topP: 0.95,
      maxTokens: Math.max(rawText.length * 2, 1024), // Ensure enough tokens for output
    });

    const correctedText = improvedResult.text;

    if (options.verbose) {
      console.log(`Post-processing complete. Corrected text length: ${correctedText.length} characters`);
      console.log(`Changed ${Math.abs(rawText.length - correctedText.length)} characters`);
    }

    await fs.writeFile('ocr_output/ocr_post_processed.txt', correctedText, 'utf-8')
    return correctedText;
  } catch (error) {
    console.error("Error during OCR post-processing:", error);
    return rawText;
  }
}

export default postProcessOCRText;