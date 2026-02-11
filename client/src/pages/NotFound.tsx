import { Link } from "react-router-dom";
import { Coffee, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <Coffee className="w-20 h-20 text-amber-200 mb-6" />
            <h1 className="text-6xl font-bold text-amber-900 mb-2 font-serif">404</h1>
            <p className="text-xl text-stone-600 mb-2">Page Not Found</p>
            <p className="text-stone-400 mb-8 max-w-sm">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/"
                className="inline-flex items-center gap-2 bg-amber-900 hover:bg-amber-800 text-amber-50 px-6 py-3 rounded-xl font-semibold transition-all shadow-md"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Menu
            </Link>
        </div>
    );
}
