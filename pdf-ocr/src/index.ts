import 'dotenv/config';
import extractPlainText from './ai/extract_plain_text.ts';
import fixOCRIssues from './ai/fix_issues.ts';
import fixSpecializedOCR from './ai/fix_specialized_issues.ts';


const ocrOptions = {
  usePreprocessing: true,
  preset: "auto",
  saveIntermediateFiles: true,
  outputPath: "./ocr_output"
};

const imagePath = "/home/chlorine/Pictures/note_3.png";


async function main() {
  try {
    const rawText = await extractPlainText(imagePath, ocrOptions);
    console.log(`Raw text length: ${rawText.length} characters`);

    if (rawText.length > 0) {
      // First fix general OCR issues
      const fixedText = await fixOCRIssues(rawText, ['all']);
      console.log(`Fixed text length: ${fixedText.length} characters`);
    }
  } catch (error) {
    console.error('Error running OCR:', error);
    process.exit(1);
  }
}

main();