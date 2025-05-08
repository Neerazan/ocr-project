import { useState, useRef } from "react";
import { uploadPdf } from "../services/api";

interface UploadFormProps {
	onUploadSuccess: (documentId: number) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUploadSuccess }) => {
	const [file, setFile] = useState<File | null>(null);
	const [title, setTitle] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const selectedFile = e.target.files[0];

			// Check if the file is a PDF
			if (selectedFile.type !== "application/pdf") {
				setError("Only PDF files are allowed");
				setFile(null);
				return;
			}

			setFile(selectedFile);
			setError(null);

			// Set default title if none exists
			if (!title) {
				setTitle(selectedFile.name.replace(".pdf", ""));
			}
		}
	};

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTitle(e.target.value);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!file) {
			setError("Please select a PDF file");
			return;
		}

		try {
			setIsUploading(true);
			setError(null);

			const result = await uploadPdf(file, title);

			setIsUploading(false);
			setFile(null);
			setTitle("");

			// Reset the file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}

			onUploadSuccess(result.documentId);
		} catch (err) {
			setIsUploading(false);
			setError(err instanceof Error ? err.message : "Failed to upload file");
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const droppedFile = e.dataTransfer.files[0];

			// Check if the file is a PDF
			if (droppedFile.type !== "application/pdf") {
				setError("Only PDF files are allowed");
				return;
			}

			setFile(droppedFile);
			setError(null);

			// Set default title if none exists
			if (!title) {
				setTitle(droppedFile.name.replace(".pdf", ""));
			}
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<h2 className="text-2xl font-semibold mb-4">Upload PDF Document</h2>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<div
					className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 text-center cursor-pointer"
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					onClick={() => fileInputRef.current?.click()}
				>
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileChange}
						accept="application/pdf"
						className="hidden"
					/>

					<div className="text-gray-500">
						{file ? (
							<div className="text-green-600">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-12 w-12 mx-auto"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<p className="mt-2 text-lg font-semibold">{file.name}</p>
								<p className="text-sm">
									{(file.size / 1024 / 1024).toFixed(2)} MB
								</p>
							</div>
						) : (
							<div>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-12 w-12 mx-auto"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
									/>
								</svg>
								<p className="mt-2">
									Drag & drop a PDF file here, or click to select
								</p>
								<p className="text-sm text-gray-400">
									PDF files only (max 10MB)
								</p>
							</div>
						)}
					</div>
				</div>

				<div className="mb-4">
					<label
						htmlFor="title"
						className="block text-gray-700 font-medium mb-2"
					>
						Document Title
					</label>
					<input
						type="text"
						id="title"
						value={title}
						onChange={handleTitleChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Enter document title"
					/>
				</div>

				<button
					type="submit"
					disabled={!file || isUploading}
					className={`w-full py-2 px-4 rounded-md text-white font-medium 
            ${
							!file || isUploading
								? "bg-gray-400 cursor-not-allowed"
								: "bg-blue-600 hover:bg-blue-700"
						}`}
				>
					{isUploading ? (
						<span className="flex items-center justify-center">
							<svg
								className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
							Processing...
						</span>
					) : (
						"Upload PDF"
					)}
				</button>
			</form>
		</div>
	);
};

export default UploadForm;
