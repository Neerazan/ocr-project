import { PostProcessingOptions } from "./types.ts";

const DEFAULT_POST_PROCESSING_OPTIONS: PostProcessingOptions = {
  modelName: "gemini-2.0-flash-001",
  correctSpelling: true,
  fixContextualErrors: true,
  fixFormatting: true,
  verbose: false,
  documentType: "general"
};

export { DEFAULT_POST_PROCESSING_OPTIONS };