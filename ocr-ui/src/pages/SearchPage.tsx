import { useState } from "react";
import { Link } from "react-router-dom";
import { searchDocuments } from "../services/api";
import type { SearchResult } from "../types";

const SearchPage: React.FC = () => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasSearched, setHasSearched] = useState(false);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!query.trim()) {
			setError("Please enter a search term");
			return;
		}

		try {
			setIsSearching(true);
			setError(null);
			const searchResults = await searchDocuments(query);
			setResults(searchResults);
			setHasSearched(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to perform search");
			setResults([]);
		} finally {
			setIsSearching(false);
		}
	};

	// Function to highlight search terms in text
	const highlightText = (text: string) => {
		if (!query) return text;

		const regex = new RegExp(`(${query})`, "gi");
		const parts = text.split(regex);

		return parts.map((part, i) =>
			regex.test(part) ? (
				<mark key={i} className="bg-yellow-200">
					{part}
				</mark>
			) : (
				part
			),
		);
	};

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold text-gray-800 mb-6">
				Search Documents
			</h1>

			{error && (
				<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
					{error}
				</div>
			)}

			<form onSubmit={handleSearch} className="flex gap-2">
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Enter search terms..."
					className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<button
					type="submit"
					disabled={isSearching}
					className={`px-4 py-2 rounded-md text-white font-medium ${
						isSearching
							? "bg-gray-400 cursor-not-allowed"
							: "bg-blue-600 hover:bg-blue-700"
					}`}
				>
					{isSearching ? (
						<span className="flex items-center">
							<svg
								className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
							Searching...
						</span>
					) : (
						"Search"
					)}
				</button>
			</form>

			{hasSearched && (
				<div className="mt-8">
					<h2 className="text-xl font-semibold text-gray-800 mb-4">
						Search Results {results.length > 0 && `(${results.length})`}
					</h2>

					{results.length === 0 ? (
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
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
							<h3 className="mt-4 text-xl font-medium text-gray-700">
								No Results Found
							</h3>
							<p className="mt-2 text-gray-500">
								No documents match your search query
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{results.map((result) => (
								<div
									key={`${result.documentId}-${result.pageNumber}`}
									className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
								>
									<div className="flex justify-between items-start mb-2">
										<Link
											to={`/documents/${result.documentId}`}
											className="text-xl font-semibold text-blue-600 hover:underline"
										>
											{result.documentTitle}
										</Link>
										<span className="text-sm text-gray-500">
											Page {result.pageNumber}
										</span>
									</div>

									<p className="text-sm text-gray-600 mb-4">
										{result.fileName}
									</p>

									<div className="border-t pt-3">
										<p className="text-gray-800">
											{highlightText(result.context)}
										</p>
									</div>

									<div className="mt-3 flex justify-end">
										<Link
											to={`/documents/${result.documentId}`}
											className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
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
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default SearchPage;
