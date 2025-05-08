import DocumentList from "../components/DocumentList";
import UploadForm from "../components/UploadForm";

interface HomePageProps {
	onUploadSuccess: (documentId: number) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onUploadSuccess }) => {
	return (
		<div className="space-y-8">
			<section>
				<h1 className="text-3xl font-bold text-gray-800 mb-6">
					Welcome to OCR Document Scanner
				</h1>
				<p className="text-gray-600 mb-4">
					Upload PDF documents to extract text content and perform searches
					across your document library.
				</p>
			</section>

			<section>
				<UploadForm onUploadSuccess={onUploadSuccess} />
			</section>

			<section>
				<h2 className="text-2xl font-semibold text-gray-800 mb-4">
					Your Documents
				</h2>
				<DocumentList />
			</section>
		</div>
	);
};

export default HomePage;
