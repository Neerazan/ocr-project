import type { Document, Page, SearchResult } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Function to upload a PDF file
export const uploadPdf = async (
	file: File,
	title?: string,
): Promise<{ documentId: number; message: string }> => {
	const formData = new FormData();
	formData.append("file", file);

	if (title) {
		formData.append("title", title);
	}

	const response = await fetch(`${API_URL}/upload`, {
		method: "POST",
		body: formData,
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to upload file");
	}

	return response.json();
};

// Function to get all documents
export const getDocuments = async (): Promise<Document[]> => {
	const response = await fetch(`${API_URL}/documents`);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to fetch documents");
	}

	return response.json();
};

// Function to get document status
export const getDocumentStatus = async (
	documentId: number,
): Promise<Document> => {
	const response = await fetch(`${API_URL}/documents/${documentId}/status`);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to fetch document status");
	}

	return response.json();
};

// Function to get a specific page from a document
export const getPage = async (
	documentId: number,
	pageNumber: number,
): Promise<Page> => {
	const response = await fetch(
		`${API_URL}/documents/${documentId}/pages/${pageNumber}`,
	);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to fetch page");
	}

	return response.json();
};

// Function to search for text in documents
export const searchDocuments = async (
	query: string,
): Promise<SearchResult[]> => {
	const response = await fetch(
		`${API_URL}/search?q=${encodeURIComponent(query)}`,
	);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to search documents");
	}

	return response.json();
};
