import { useState } from "react";
import { Link } from "react-router-dom";
import type { SearchResult } from "../types";
import { searchDocuments } from "../services/api";

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
			setHasSearched(true);

			const searchResults = await searchDocuments(query);
			setResults(searchResults);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to perform search");
			setResults([]);
		} finally {
			setIsSearching(false);
		}
	};

	const highlightSearchTerm = (text: string) => {
		if (!query) return text;

		const regex = new RegExp(`(${query})`, "gi");
		return text.replace(
			regex,
			'<span class="bg-yellow-200 font-semibold">$1</span>',
		);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">Search Documents</h1>

			{/* Search Form */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-8">
				<form
					onSubmit={handleSearch}
					className="flex flex-col md:flex-row gap-4"
				>
					<div className="flex-grow">
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Enter search term..."
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<button
						type="submit"
						className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
						disabled={isSearching}
					>
						{isSearching ? (
							<span className="flex items-center justify-center">
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
			</div>

			{/* Error Message */}
			{error && (
				<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
					<p className="font-bold">Error</p>
					<p>{error}</p>
				</div>
			)}

			{/* Search Results */}
			{hasSearched && (
				<div>
					<h2 className="text-xl font-semibold mb-4">
						Search Results {results.length > 0 ? `(${results.length})` : ""}
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
								Try searching with different keywords or check your spelling
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{results.map((result, index) => (
								<div
									key={`${result.documentId}-${result.pageNumber}-${index}`}
									className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
								>
									<div className="flex justify-between items-start mb-2">
										<h3 className="text-lg font-semibold text-gray-800">
											{result.documentTitle}
										</h3>
										<span className="text-sm text-gray-500">
											Page {result.pageNumber}
										</span>
									</div>
									<p className="text-sm text-gray-600 mb-3">
										{result.fileName}
									</p>
									<div className="bg-gray-50 p-3 rounded-md mb-3">
										<p
											className="text-gray-700"
											dangerouslySetInnerHTML={{
												__html: highlightSearchTerm(result.snippet),
											}}
										></p>
									</div>
									<Link
										to={`/documents/${result.documentId}?page=${result.pageNumber}`}
										className="inline-flex items-center text-blue-600 hover:text-blue-800"
									>
										View in document
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
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default SearchPage;
