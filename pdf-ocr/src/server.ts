import express from "express";
import multer from "multer";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fromPath } from "pdf2pic";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { PDFDocument } from "pdf-lib";
import extractPlainText from "./ai/extract_plain_text.ts";
import fixOCRIssues from "./ai/fix_issues.ts";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Initialize Prisma client for database operations
const prisma = new PrismaClient();

// Configure CORS to allow requests from our React app
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = path.join(__dirname, "uploads");
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		if (file.mimetype === "application/pdf") {
			cb(null, true);
		} else {
			cb(new Error("Only PDF files are allowed"));
		}
	},
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
});

// Create output directories if they don't exist
const createDirectories = () => {
	const dirs = [
		path.join(__dirname, "uploads"),
		path.join(__dirname, "images"),
		path.join(__dirname, "ocr_output"),
	];

	for (const dir of dirs) {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
	}
};

createDirectories();

// Utility: count pages with pdf-lib
async function getPdfPageCount(filePath: string): Promise<number> {
	const bytes = await fs.promises.readFile(filePath);
	const pdf = await PDFDocument.load(bytes);
	return pdf.getPageCount();
}

// API endpoint to upload and process a PDF file
app.post("/api/upload", upload.single("file"), async (req:any, res:any) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "No file uploaded" });
		}

		const pdfPath = req.file.path;
		const pdfFileName = req.file.originalname;
		const documentTitle = req.body.title || pdfFileName.replace(".pdf", "");

		// Create a new document record in the database
		const document = await prisma.document.create({
			data: {
				title: documentTitle,
				filePath: pdfPath,
				fileName: pdfFileName,
			},
		});

		// Process the PDF asynchronously and respond to the client
		res.status(202).json({
			message: "PDF uploaded successfully and processing has begun",
			documentId: document.id,
		});

		// Start processing the PDF in the background
		processPdf(pdfPath, document.id).catch((err) => {
			console.error("Error processing PDF:", err);
		});
	} catch (error) {
		console.error("Error uploading file:", error);
		res.status(500).json({ error: "Failed to upload and process the file" });
	}
});

// Function to process PDF file
async function processPdf(pdfPath: string, documentId: number) {
	try {
		// Get page count using pdf-lib
		const pageCount = await getPdfPageCount(pdfPath);

		// Update document with page count
		await prisma.document.update({
			where: { id: documentId },
			data: { pageCount: pageCount, status: "PROCESSING" },
		});

		// Create output directory for images
		const outputDir = path.join(__dirname, "images", documentId.toString());
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		// Configure pdf2pic options
		const pdf2picOptions = {
			density: 300, // Higher density for better quality
			savePath: outputDir,
			saveFilename: "page",
			format: "png",
			width: 2048, // Adjust width as needed for better quality
			height: 2048 // Adjust height as needed for better quality
		};

		// Initialize pdf2pic converter
		const convert = fromPath(pdfPath, pdf2picOptions);

		// Convert each page to an image
		for (let i = 1; i <= pageCount; i++) {
			// Convert page to image
			const pageData = await convert(i);
			const pageImagePath = pageData.path;

			// Preprocess the image
			const preprocessedImage = await preprocessImage(pageImagePath!);
			const preprocessedImagePath = path.join(
				outputDir,
				`page-${i}-preprocessed.png`,
			);

			if (preprocessedImage) {
				const base64Data = preprocessedImage.replace(
					/^data:image\/png;base64,/,
					"",
				);
				fs.writeFileSync(preprocessedImagePath, base64Data, "base64");

				const ocrOptions = {
					usePreprocessing: false, // Already preprocessed
					preset: "auto",
					saveIntermediateFiles: true,
					outputPath: path.join(
						__dirname,
						"ocr_output",
						documentId.toString(),
						i.toString(),
					),
				};

				if (!fs.existsSync(ocrOptions.outputPath)) {
					fs.mkdirSync(ocrOptions.outputPath, { recursive: true });
				}
				// Extract text
				const rawText = await extractPlainText(
					preprocessedImagePath,
					ocrOptions,
				);

				// Fix OCR issues
				const fixedText = await fixOCRIssues(rawText, ["all"]);

				// Save the page text to database
				await prisma.page.create({
					data: {
						documentId: documentId,
						pageNumber: i,
						content: fixedText,
						imagePath: preprocessedImagePath,
					},
				});
			}
		}

		// Update document status to completed
		await prisma.document.update({
			where: { id: documentId },
			data: { status: "COMPLETED" },
		});

		console.log(`Processing completed for document ID ${documentId}`);
	} catch (error) {
		console.error("Error processing PDF:", error);

		// Update document status to error
		await prisma.document.update({
			where: { id: documentId },
			data: { status: "ERROR" },
		});
	}
}

// Function to preprocess image using Python service
async function preprocessImage(imagePath: string): Promise<string | null> {
	try {
		const formData = new FormData();
		const imageFile = fs.readFileSync(imagePath);
		const blob = new Blob([imageFile]);
		formData.append("file", blob, path.basename(imagePath));

		const response = await axios.post(
			"http://localhost:8000/preprocess/",
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			},
		);

		if (response.data?.processed_image) {
			return response.data.processed_image;
		}

		return null;
	} catch (error) {
		console.error("Error preprocessing image:", error);
		return null;
	}
}

// API endpoint to get document status
app.get("/api/documents/:id/status", async (req:any, res:any) => {
	try {
		const documentId = Number.parseInt(req.params.id);

		const document = await prisma.document.findUnique({
			where: { id: documentId },
		});

		if (!document) {
			return res.status(404).json({ error: "Document not found" });
		}

		res.json({
			id: document.id,
			title: document.title,
			status: document.status,
			pageCount: document.pageCount,
			createdAt: document.createdAt,
		});
	} catch (error) {
		console.error("Error getting document status:", error);
		res.status(500).json({ error: "Failed to get document status" });
	}
});

// API endpoint to get all documents
app.get("/api/documents", async (req, res) => {
	try {
		const documents = await prisma.document.findMany({
			orderBy: { createdAt: "desc" },
		});

		res.json(documents);
	} catch (error) {
		console.error("Error getting documents:", error);
		res.status(500).json({ error: "Failed to get documents" });
	}
});

// API endpoint to get document page
app.get("/api/documents/:id/pages/:pageNum", async (req:any, res:any) => {
	try {
		const documentId = Number.parseInt(req.params.id);
		const pageNum = Number.parseInt(req.params.pageNum);

		const page = await prisma.page.findFirst({
			where: {
				documentId: documentId,
				pageNumber: pageNum,
			},
		});

		if (!page) {
			return res.status(404).json({ error: "Page not found" });
		}

		// Return page data
		res.json(page);
	} catch (error) {
		console.error("Error getting page:", error);
		res.status(500).json({ error: "Failed to get page" });
	}
});

// API endpoint to search documents
app.get("/api/search", async (req:any, res:any) => {
	try {
		const query = req.query.q as string;

		if (!query || query.trim().length === 0) {
			return res.status(400).json({ error: "Search query is required" });
		}

		// Search for pages containing the query
		const pages = await prisma.page.findMany({
			where: {
				content: {
					contains: query,
					mode: "insensitive",
				},
			},
			include: {
				document: {
					select: {
						id: true,
						title: true,
						fileName: true,
					},
				},
			},
		});

		// Group results by document
		const results = pages.map((page:any) => ({
			documentId: page.documentId,
			documentTitle: page.document.title,
			fileName: page.document.fileName,
			pageNumber: page.pageNumber,
			snippet: extractSnippet(page.content, query),
		}));

		res.json(results);
	} catch (error) {
		console.error("Error searching documents:", error);
		res.status(500).json({ error: "Failed to search documents" });
	}
});

// Helper function to extract a snippet of text containing the search query
function extractSnippet(content: string, query: string): string {
	const lowerContent = content.toLowerCase();
	const lowerQuery = query.toLowerCase();
	const index = lowerContent.indexOf(lowerQuery);

	if (index === -1) return `${content.substring(0, 100)}...`;

	const start = Math.max(0, index - 50);
	const end = Math.min(content.length, index + query.length + 50);
	let snippet = content.substring(start, end);

	if (start > 0) snippet = `...${snippet}`;
	if (end < content.length) snippet = `${snippet}...`;

	return snippet;
}

// Start the server
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});