import { Link } from "react-router-dom";
import type { Document } from "../types";

interface DocumentCardProps {
	document: Document;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
	// Format the date
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

	// Get status badge color
	const getStatusColor = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return "bg-green-100 text-green-800";
			case "PROCESSING":
				return "bg-blue-100 text-blue-800";
			case "ERROR":
				return "bg-red-100 text-red-800";
			default:
				return "bg-yellow-100 text-yellow-800";
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
			<div className="px-6 py-4">
				<div className="flex justify-between items-start mb-2">
					<h3 className="text-xl font-semibold text-gray-800 truncate">
						{document.title}
					</h3>
					<span
						className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(document.status)}`}
					>
						{document.status}
					</span>
				</div>

				<p className="text-sm text-gray-600 mb-4">
					{document.fileName}
					{document.pageCount && (
						<span className="ml-2">({document.pageCount} pages)</span>
					)}
				</p>

				<div className="flex justify-between items-center">
					<span className="text-xs text-gray-500">
						Uploaded: {formatDate(document.createdAt)}
					</span>

					<Link
						to={`/documents/${document.id}`}
						className="inline-flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
					>
						View Document
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 w-4 ml-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M14 5l7 7m0 0l-7 7m7-7H3"
							/>
						</svg>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default DocumentCard;
