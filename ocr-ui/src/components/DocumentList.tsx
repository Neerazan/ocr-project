import { useState, useEffect } from "react";
import type { Document } from "../types";
import { getDocuments } from "../services/api";
import DocumentCard from "./DocumentCard";

const DocumentList: React.FC = () => {
	const [documents, setDocuments] = useState<Document[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchDocuments();
	}, []);

	const fetchDocuments = async () => {
		try {
			setLoading(true);
			setError(null);
			const docs = await getDocuments();
			setDocuments(docs);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to fetch documents",
			);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
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
					<p className="mt-3 text-gray-600">Loading documents...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
				role="alert"
			>
				<p className="font-bold">Error</p>
				<p>{error}</p>
				<button
					type="button"
					onClick={fetchDocuments}
					className="mt-3 bg-red-200 hover:bg-red-300 text-red-800 font-semibold py-1 px-3 rounded-md text-sm transition-colors"
				>
					Try Again
				</button>
			</div>
		);
	}

	if (documents.length === 0) {
		return (
			<div className="bg-gray-100 rounded-lg p-8 text-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-16 w-16 mx-auto text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<h3 className="mt-4 text-xl font-medium text-gray-700">
					No Documents Yet
				</h3>
				<p className="mt-2 text-gray-500">
					Upload your first PDF document to get started
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{documents.map((doc) => (
				<DocumentCard key={doc.id} document={doc} />
			))}
		</div>
	);
};

export default DocumentList;
