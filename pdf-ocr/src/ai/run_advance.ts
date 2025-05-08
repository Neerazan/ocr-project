import fs from "fs/promises";
import { PostProcessingOptions } from "../types.ts";
import { DEFAULT_POST_PROCESSING_OPTIONS } from "../constants.ts";
import extractPlainText from "./extract_plain_text.ts";
import postProcessOCRText from "./post_process.ts";

async function enhancedOCR(
  imagePath: string,
  ocrOptions: any = {},
  postProcessOptions: PostProcessingOptions = DEFAULT_POST_PROCESSING_OPTIONS
): Promise<string> {
  try {
    // Step 1: Perform initial OCR extraction
    const rawText = await extractPlainText(
      imagePath,
      ocrOptions
    );

    console.log("Initial OCR extraction complete");
    console.log(`Raw text length: ${rawText.length} characters`);

    // Step 2: Post-process the OCR text with AI
    if (postProcessOptions.verbose) {
      console.log("Starting AI post-processing...");
    }

    const correctedText = await postProcessOCRText(rawText, postProcessOptions);

    console.log("AI post-processing complete");
    console.log(`Corrected text length: ${correctedText.length} characters`);

    // Optional: Save post-processed result
    await fs.writeFile(`${ocrOptions.outputPath || './ocr_output'}/post_processed.txt`, correctedText);

    return correctedText;
  } catch (error) {
    console.error("Enhanced OCR process failed:", error);
    throw error;
  }
}

async function runAdvancedOCR() {
  try {
    const imagePath = "/home/chlorine/Pictures/note_1.png";

    // Set up OCR and post-processing options
    const ocrOptions = {
      usePreprocessing: true,
      preset: "handwriting",
      saveIntermediateFiles: true,
      outputPath: "./ocr_output"
    };

    const postProcessOptions: PostProcessingOptions = {
      modelName: "gemini-2.0-flash-001",
      correctSpelling: true,
      fixContextualErrors: true,
      fixFormatting: true,
      verbose: true,
      documentType: "academic" as const
    };

    // Run enhanced OCR with post-processing
    const result = await enhancedOCR(imagePath, ocrOptions, postProcessOptions);

    console.log("Advanced OCR with post-processing complete");
    console.log(`Final text length: ${result.length} characters`);

    // Save the final result
    await fs.writeFile("advanced_ocr_result.txt", result, "utf-8");

    return result;
  } catch (error) {
    console.error("Advanced OCR failed:", error);
  }
}

export default runAdvancedOCR;