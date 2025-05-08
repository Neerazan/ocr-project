export interface Document {
	id: number;
	title: string;
	fileName: string;
	filePath?: string;
	pageCount?: number;
	status: "PENDING" | "PROCESSING" | "COMPLETED" | "ERROR";
	createdAt: string;
	updatedAt?: string;
}

export interface Page {
	id: number;
	documentId: number;
	pageNumber: number;
	content: string;
	imagePath: string;
	createdAt: string;
	updatedAt?: string;
}

export interface SearchResult {
	documentId: number;
	documentTitle: string;
	fileName: string;
	pageNumber: number;
	snippet: string;
}
