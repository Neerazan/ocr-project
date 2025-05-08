import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DocumentViewer from "../components/DocumentViewer";

interface DocumentDetailPageProps {
	onMount: () => void;
}

const DocumentDetailPage: React.FC<DocumentDetailPageProps> = ({ onMount }) => {
	const { documentId } = useParams<{ documentId: string }>();

	useEffect(() => {
		// Call onMount to reset any redirect states in parent components
		onMount();
	}, [onMount]);

	if (!documentId || Number.isNaN(Number.parseInt(documentId))) {
		return (
			<div
				className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
				role="alert"
			>
				<p className="font-bold">Error</p>
				<p>Invalid document ID</p>
				<Link
					to="/"
					className="mt-3 inline-block text-blue-600 hover:underline"
				>
					Return to Home
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold text-gray-800">Document Details</h1>
				<Link
					to="/"
					className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-md transition-colors"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-4 w-4 mr-1"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						/>
					</svg>
					Back to Documents
				</Link>
			</div>

			<DocumentViewer documentId={Number.parseInt(documentId)} />
		</div>
	);
};

export default DocumentDetailPage;
