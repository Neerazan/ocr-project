import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import fs from "fs";
import { OcrOptions } from "../types.ts";
import { getInitialTextExtractionPrompt, preprocessImage } from "../utils.ts";



// Calls Gemini with a text‐and‐image prompt
async function callGeminiOcr(imageBuffer: Buffer): Promise<string> {
  // const prompt = getInitialTextExtractionPrompt('general');
  const prompt = `You are an expert in OCR. Please extract the text from the image and return it in plain text format. Do not include any explanations or additional information.`;

  const response = await generateText({
    model: google('gemini-2.0-flash-thinking-exp-01-21'),
    messages: [
      // {
      //   role: "system",
      //   content: context
      // },
      {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image',
          mimeType: 'image/png',
          image: imageBuffer
        }
      ]
    }]
  });

  if (!response.text) {
    throw new Error('No text returned from Gemini');
  }

  return response.text;
}

async function getContext(imageBuffer: Buffer): Promise<string> {
  const prompt = `Based on the image, please provide a brief context or description of the content. that will help in understanding the text extraction process for AI Models.`;
  const response = await generateText({
    model: google('gemini-2.0-flash-thinking-exp-01-21'),
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image',
          mimeType: 'image/png',
          image: imageBuffer
        }
      ]
    }]
  });
  if (!response.text) {
    throw new Error('No context returned from Gemini');
  }
  return response.text;
}

async function extractPlainText(
  imagePath: string,
  {
    usePreprocessing = false,
    preset = 'auto',
    saveIntermediateFiles = false,
    outputPath,
  }: OcrOptions
): Promise<string> {
  try {
    let raw = await fs.promises.readFile(imagePath);

    const buffer = usePreprocessing
      ? await preprocessImage(raw, preset)
      : raw;

    // const context = await getContext(buffer);
    const extractedText = await callGeminiOcr(buffer);

    if (saveIntermediateFiles && outputPath) {
      await fs.promises.writeFile(`${outputPath}/extracted_plain_text.txt`, extractedText);
    }

    return extractedText;
  } catch (err) {
    console.error('[extractPlainText] failed:', err);
    throw err;
  }
}

export default extractPlainText;