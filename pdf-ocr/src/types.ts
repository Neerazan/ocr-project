interface PostProcessingOptions {
  modelName?: string;
  correctSpelling?: boolean;
  fixContextualErrors?: boolean;
  fixFormatting?: boolean;
  verbose?: boolean;
  documentType?: "general" | "academic" | "technical" | "legal" | "medical" | "invoice";
}

interface OcrOptions {
  usePreprocessing: boolean;
  preset: string;
  saveIntermediateFiles: boolean;
  outputPath?: string;
}

export {
  PostProcessingOptions,
  OcrOptions,
}