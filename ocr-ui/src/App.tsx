import { useState } from "react";
import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
	useNavigate,
} from "react-router-dom";
import Header from "./components/Header";
import DocumentList from "./components/DocumentList";
import DocumentViewer from "./components/DocumentViewer";
import UploadForm from "./components/UploadForm";
import SearchPage from "./components/SearchPage";

// Home page that shows document list and upload form
const HomePage: React.FC = () => {
	const navigate = useNavigate();
	const [_, setUploadSuccess] = useState(false);

	const handleUploadSuccess = (documentId: number) => {
		setUploadSuccess(true);
		// Navigate to the document view page after successful upload
		navigate(`/documents/${documentId}`);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-1">
					<UploadForm onUploadSuccess={handleUploadSuccess} />
				</div>
				<div className="lg:col-span-2">
					<h2 className="text-2xl font-semibold mb-4">Your Documents</h2>
					<DocumentList />
				</div>
			</div>
		</div>
	);
};

// Document view page
const DocumentViewPage: React.FC = () => {
	// Get the document ID from the URL
	const documentId = Number.parseInt(window.location.pathname.split("/")[2]);

	return (
		<div className="container mx-auto px-4 py-8">
			<DocumentViewer documentId={documentId} />
		</div>
	);
};

const App: React.FC = () => {
	return (
		<BrowserRouter>
			<div className="min-h-screen bg-gray-50 flex flex-col">
				<Header />
				<main className="flex-grow py-6">
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/documents/:id" element={<DocumentViewPage />} />
						<Route path="/search" element={<SearchPage />} />
						<Route path="*" element={<Navigate to="/" />} />
					</Routes>
				</main>
				<footer className="bg-gray-800 text-white py-4">
					<div className="container mx-auto px-4 text-center">
						<p>&copy; {new Date().getFullYear()} OCR Document Scanner</p>
					</div>
				</footer>
			</div>
		</BrowserRouter>
	);
};

export default App;
