import { useState, useEffect } from "react";
import type { Document, Page } from "../types";
import { getPage, getDocumentStatus } from "../services/api";

interface DocumentViewerProps {
	documentId: number;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentId }) => {
	const [document, setDocument] = useState<Document | null>(null);
	const [currentPage, setCurrentPage] = useState<Page | null>(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<"text" | "image">("image");

	useEffect(() => {
		const fetchDocument = async () => {
			try {
				setLoading(true);
				setError(null);
				const doc = await getDocumentStatus(documentId);
				setDocument(doc);

				// Only fetch the first page if the document is completed or has pages
				if (doc.status === "COMPLETED" || doc.pageCount) {
					await fetchPage(documentId, 1);
				}
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to fetch document",
				);
			} finally {
				setLoading(false);
			}
		};

		fetchDocument();

		// Set up polling for document status if it's not completed
		const intervalId = setInterval(async () => {
			try {
				const doc = await getDocumentStatus(documentId);
				setDocument(doc);

				if (doc.status === "COMPLETED") {
					clearInterval(intervalId);

					// Fetch the current page if we don't have it yet
					if (!currentPage) {
						await fetchPage(documentId, 1);
					}
				}
			} catch (error) {
				console.error("Error polling document status:", error);
			}
		}, 5000); // Poll every 5 seconds

		return () => clearInterval(intervalId);
	}, [documentId]);

	const fetchPage = async (docId: number, pageNum: number) => {
		try {
			setLoading(true);
			setError(null);
			const page = await getPage(docId, pageNum);
			setCurrentPage(page);
			setPageNumber(pageNum);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : `Failed to fetch page ${pageNum}`,
			);
		} finally {
			setLoading(false);
		}
	};

	const goToPage = (pageNum: number) => {
		if (!document || !document.pageCount) return;

		if (pageNum < 1) {
			pageNum = 1;
		} else if (pageNum > document.pageCount) {
			pageNum = document.pageCount;
		}

		if (pageNum !== pageNumber) {
			fetchPage(documentId, pageNum);
		}
	};

	const goToPreviousPage = () => {
		goToPage(pageNumber - 1);
	};

	const goToNextPage = () => {
		goToPage(pageNumber + 1);
	};

	// Function to format timestamp
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	if (loading && !document) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="flex flex-col items-center">
					<svg
						className="animate-spin h-10 w-10 text-blue-500"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						></circle>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<p className="mt-3 text-gray-600">Loading document...</p>
				</div>
			</div>
		);
	}

	if (error && !document) {
		return (
			<div
				className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
				role="alert"
			>
				<p className="font-bold">Error</p>
				<p>{error}</p>
			</div>
		);
	}

	if (!document) {
		return (
			<div
				className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
				role="alert"
			>
				<p className="font-bold">Error</p>
				<p>Document not found</p>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden">
			{/* Document Header */}
			<div className="bg-gray-100 px-6 py-4 border-b">
				<div className="flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-semibold text-gray-800">
							{document.title}
						</h2>
						<p className="text-sm text-gray-600">
							{document.fileName}
							{document.pageCount && (
								<span className="ml-2">({document.pageCount} pages)</span>
							)}
						</p>
					</div>

					<span
						className={`px-3 py-1 text-sm font-semibold rounded-full 
            ${
							document.status === "COMPLETED"
								? "bg-green-100 text-green-800"
								: document.status === "PROCESSING"
									? "bg-blue-100 text-blue-800"
									: document.status === "ERROR"
										? "bg-red-100 text-red-800"
										: "bg-yellow-100 text-yellow-800"
						}`}
					>
						{document.status}
					</span>
				</div>

				<p className="text-xs text-gray-500 mt-2">
					Uploaded: {formatDate(document.createdAt)}
				</p>
			</div>

			{/* Document Content */}
			<div className="p-6">
				{/* Processing Status Message */}
				{document.status === "PROCESSING" && (
					<div
						className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-4"
						role="alert"
					>
						<div className="flex items-center">
							<svg
								className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							<div>
								<p className="font-bold">Processing Document</p>
								<p className="text-sm">
									This may take a few minutes depending on the size of the
									document.
								</p>
							</div>
						</div>
					</div>
				)}

				{document.status === "ERROR" && (
					<div
						className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
						role="alert"
					>
						<p className="font-bold">Processing Error</p>
						<p>
							There was an error processing this document. Please try uploading
							it again.
						</p>
					</div>
				)}

				{/* View Mode Toggle */}
				{document.status === "COMPLETED" && currentPage && (
					<div className="mb-4 flex justify-end">
						<div className="inline-flex rounded-md shadow-sm" role="group">
							<button
								type="button"
								onClick={() => setViewMode("image")}
								className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
									viewMode === "image"
										? "bg-blue-600 text-white border-blue-600"
										: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
								}`}
							>
								Image
							</button>
							<button
								type="button"
								onClick={() => setViewMode("text")}
								className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
									viewMode === "text"
										? "bg-blue-600 text-white border-blue-600"
										: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
								}`}
							>
								Text
							</button>
						</div>
					</div>
				)}

				{/* Page Content */}
				{loading && document.status === "COMPLETED" ? (
					<div className="flex justify-center items-center h-64">
						<div className="flex flex-col items-center">
							<svg
								className="animate-spin h-10 w-10 text-blue-500"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							<p className="mt-3 text-gray-600">Loading page {pageNumber}...</p>
						</div>
					</div>
				) : document.status === "COMPLETED" && currentPage ? (
					<div>
						{viewMode === "image" ? (
							<div className="border rounded-lg overflow-hidden">
								<img
									src={`http://localhost:5000/api/images/${currentPage.imagePath}`}
									alt={`Page ${pageNumber}`}
									className="w-full h-auto"
								/>
							</div>
						) : (
							<div className="border rounded-lg p-4 bg-gray-50 h-96 overflow-y-auto">
								<pre className="whitespace-pre-wrap font-sans text-gray-800">
									{currentPage.content}
								</pre>
							</div>
						)}
					</div>
				) : null}

				{/* Page Navigation */}
				{document.status === "COMPLETED" &&
					document.pageCount &&
					document.pageCount > 1 && (
						<div className="mt-4 flex items-center justify-between">
							<button
								onClick={goToPreviousPage}
								disabled={pageNumber <= 1}
								className={`flex items-center px-3 py-2 rounded-md ${
									pageNumber <= 1
										? "bg-gray-100 text-gray-400 cursor-not-allowed"
										: "bg-blue-100 text-blue-700 hover:bg-blue-200"
								}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5 mr-1"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 19l-7-7 7-7"
									/>
								</svg>
								Previous
							</button>

							<div className="flex items-center">
								<span className="mr-2">Page</span>
								<input
									type="number"
									min="1"
									max={document.pageCount}
									value={pageNumber}
									onChange={(e) => {
										const value = parseInt(e.target.value);
										if (!isNaN(value)) {
											goToPage(value);
										}
									}}
									className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md"
								/>
								<span className="mx-2">of {document.pageCount}</span>
							</div>

							<button
								onClick={goToNextPage}
								disabled={pageNumber >= (document.pageCount || 1)}
								className={`flex items-center px-3 py-2 rounded-md ${
									pageNumber >= (document.pageCount || 1)
										? "bg-gray-100 text-gray-400 cursor-not-allowed"
										: "bg-blue-100 text-blue-700 hover:bg-blue-200"
								}`}
							>
								Next
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5 ml-1"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
						</div>
					)}
			</div>
		</div>
	);
};

export default DocumentViewer;
