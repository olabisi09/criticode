import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, FileQuestion, ArrowLeft, Code } from "lucide-react";
import { Button } from "../components/ui/Button";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Illustration */}
        <div className="mb-8 relative">
          {/* Main 404 with decorative elements */}
          <div className="relative inline-block">
            <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-600 bg-clip-text select-none">
              404
            </h1>

            {/* Floating code icons */}
            <div className="absolute -top-4 -right-4 opacity-20 animate-bounce">
              <Code className="h-12 w-12 text-blue-500" />
            </div>
            <div className="absolute -bottom-2 -left-6 opacity-30 animate-pulse">
              <FileQuestion className="h-16 w-16 text-indigo-500" />
            </div>
          </div>

          {/* Subtle background pattern */}
          <div className="absolute inset-0 -z-10 opacity-5">
            <div className="grid grid-cols-8 gap-4 h-full">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-blue-500 rounded animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Oops! Page Not Found
          </h2>

          <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
            The page you're looking for doesn't exist. It might have been moved,
            deleted, or you entered the wrong URL.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-auto max-w-md">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Check the URL or try navigating from our
              homepage to find what you're looking for.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleGoHome}
            size="lg"
            className="flex items-center gap-3 px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Button>

          <Button
            variant="secondary"
            onClick={handleGoBack}
            size="lg"
            className="flex items-center gap-3 px-8 py-4 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Button>
        </div>

        {/* Additional Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 mb-4">Or explore these sections:</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Code Analysis
            </button>
            <button
              onClick={() => navigate("/history")}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Review History
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
