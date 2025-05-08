import { Link, useLocation } from "react-router-dom";

const Header: React.FC = () => {
	const location = useLocation();

	return (
		<header className="bg-gray-800 text-white shadow-lg">
			<div className="container mx-auto px-4 py-4 flex justify-between items-center">
				<Link to="/" className="text-2xl font-bold">
					OCR Document Scanner
				</Link>

				<nav className="flex space-x-4">
					<Link
						to="/"
						className={`px-3 py-2 rounded-md hover:bg-gray-700 transition-colors ${
							location.pathname === "/" ? "bg-gray-700" : ""
						}`}
					>
						Home
					</Link>

					<Link
						to="/search"
						className={`px-3 py-2 rounded-md hover:bg-gray-700 transition-colors ${
							location.pathname === "/search" ? "bg-gray-700" : ""
						}`}
					>
						Search
					</Link>
				</nav>
			</div>
		</header>
	);
};

export default Header;
