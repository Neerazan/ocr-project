import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import fs from "fs/promises";

async function fixOCRIssues(
	text: string,
	issues: Array<"spelling" | "context" | "formatting" | "technical" | "all"> = [
		"all",
	],
	modelName: string = "gemini-2.0-flash-001",
): Promise<string> {
	try {
		if (text.length < 20) return text;

		const model = google(modelName);

		const fixAll = issues.includes("all");
		const fixSpelling = fixAll || issues.includes("spelling");
		const fixContext = fixAll || issues.includes("context");
		const fixFormatting = fixAll || issues.includes("formatting");
		const fixTechnical = fixAll || issues.includes("technical");

		// Create a focused prompt based on requested fixes
		let focusedPrompt = `
      You are an expert in fixing OCR errors. Please correct the following text by focusing on:
      ${fixSpelling ? "- Fixing spelling errors\n" : ""}
      ${fixContext ? "- Fixing contextual errors (words that don't make sense in context)\n" : ""}
      ${fixFormatting ? "- Fixing formatting issues (paragraph breaks, lists, etc.)\n" : ""}
      ${fixTechnical ? "- Fixing technical notation, numbers, and special characters\n" : ""}

      Please preserve the original meaning and content. Return only the corrected text without explanations.

      Here is the text to fix: ${text}`;

		const result = await generateText({
			model,
			messages: [
				{
					role: "user",
					content: [{ type: "text", text: focusedPrompt }],
				},
			],
			temperature: 0.1,
			topP: 0.95,
			maxTokens: Math.max(text.length * 2, 1024),
		});

		return result.text;
	} catch (error) {
		console.error("Error fixing OCR issues:", error);
		return text;
	}
}

export default fixOCRIssues;
