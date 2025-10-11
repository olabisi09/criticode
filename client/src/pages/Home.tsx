import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  AlertCircle,
  RotateCcw,
  Download,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { CodeEditor } from "../components/code-editor/CodeEditor";
import { FileUpload } from "../components/code-editor/FileUpload";
import { AnalysisResults } from "../components/review-results/AnalysisResults";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Navigation } from "../components/ui/Navigation";
import { useAnalyzeCode, useUploadFile } from "../hooks/useReviews";
import { useAuthStore } from "../store/authStore";
import type { AnalysisResult } from "../types";

// Supported languages for the language selector
const supportedLanguages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
];

// Memoized Home component for better performance
const Home: React.FC = React.memo(() => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [fileName, setFileName] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [splitView, setSplitView] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated } = useAuthStore();
  const analyzeCodeMutation = useAnalyzeCode();
  const uploadFileMutation = useUploadFile();

  // Memoized loading state
  const isLoading = useMemo(
    () => analyzeCodeMutation.isPending || uploadFileMutation.isPending,
    [analyzeCodeMutation.isPending, uploadFileMutation.isPending]
  );

  // Memoized code change handler
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    setError(null);
  }, []);

  // Memoized language change handler
  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
  }, []);

  // Memoized file select handler
  const handleFileSelect = useCallback(
    async (file: { fileName: string; content: string; language: string }) => {
      setFileName(file.fileName);
      setCode(file.content);
      setLanguage(file.language);
      setError(null);

      try {
        const result = await uploadFileMutation.mutateAsync(
          new File([file.content], file.fileName)
        );
        setAnalysisResult(result);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to upload and analyze file";
        setError(errorMessage);
      }
    },
    [uploadFileMutation]
  );

  // Scroll to results smoothly
  useEffect(() => {
    if (analysisResult && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [analysisResult]);

  const handleAnalyzeCode = async () => {
    // Validate code is not empty
    if (!code.trim()) {
      setError("Please enter some code to analyze");
      return;
    }

    setError(null);

    try {
      const result = await analyzeCodeMutation.mutateAsync({
        code: code.trim(),
        language,
        fileName: fileName || undefined,
      });
      setAnalysisResult(result);
      toast.success("Code analysis completed successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to analyze code";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleLineHighlight = (lineNumber: number) => {
    setHighlightedLine(lineNumber);

    // Show highlighted line in toast
    toast.info(`Highlighting line ${lineNumber} in code`);

    // Scroll to results section
    resultsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleExportResults = (format: "json" | "pdf") => {
    if (!analysisResult) return;

    if (format === "json") {
      const dataStr = JSON.stringify(analysisResult, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `analysis-${
        fileName || "code"
      }-${new Date().getTime()}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      toast.success("Analysis results exported as JSON");
    } else if (format === "pdf") {
      // For PDF export, we would need a PDF library like jsPDF
      // For now, we'll show a placeholder
      toast.info("PDF export feature coming soon!");
    }
  };

  const handleSaveToHistory = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save to history");
      return;
    }

    try {
      // Here you would call your save to history API
      // For now, we'll simulate the save
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Analysis saved to your history!");
    } catch {
      toast.error("Failed to save to history");
    }
  };

  const toggleSplitView = () => {
    setSplitView(!splitView);
  };

  const handleAnalyzeAnother = () => {
    setAnalysisResult(null);
    setCode("");
    setFileName("");
    setError(null);
  };

  const getCharacterCount = () => code.length;
  const getLineCount = () => code.split("\n").length;

  // If we have analysis results, show them
  if (analysisResult) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl" ref={resultsRef}>
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Analysis Results
              </h1>
              {fileName && (
                <p className="text-muted-foreground">
                  File: <span className="font-medium">{fileName}</span> (
                  {language})
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleSplitView}
                className="flex items-center gap-2"
              >
                {splitView ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {splitView ? "Hide Code" : "Show Code"}
              </Button>

              {/* Export Dropdown */}
              <div className="relative group">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1 min-w-[120px]">
                    <button
                      onClick={() => handleExportResults("json")}
                      className="w-full px-3 py-2 text-sm text-popover-foreground hover:bg-accent text-left"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={() => handleExportResults("pdf")}
                      className="w-full px-3 py-2 text-sm text-popover-foreground hover:bg-accent text-left"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Save to History */}
              {isAuthenticated && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSaveToHistory}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save to History
                </Button>
              )}

              {/* Analyze Another */}
              <Button
                variant="secondary"
                onClick={handleAnalyzeAnother}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Analyze Another
              </Button>
            </div>
          </div>
        </div>

        {/* Split View Layout */}
        {splitView ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Code Editor - Read-only */}
            <Card
              title={`Code${
                highlightedLine ? ` (Line ${highlightedLine} highlighted)` : ""
              }`}
            >
              <CodeEditor
                code={code}
                language={language}
                onChange={() => {}} // Read-only
                readOnly={true}
              />
            </Card>

            {/* Analysis Results */}
            <Card title="Analysis">
              <div className="max-h-[600px] overflow-y-auto">
                <AnalysisResults
                  analysisResult={analysisResult}
                  onLineClick={handleLineHighlight}
                />
              </div>
            </Card>
          </div>
        ) : (
          /* Full Width Results */
          <AnalysisResults
            analysisResult={analysisResult}
            onLineClick={handleLineHighlight}
          />
        )}
      </div>
    );
  }

  // Main editor view
  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            AI Code Review
          </h1>
          <p className="text-lg text-muted-foreground">
            Get instant feedback on your code quality, security, and best
            practices
          </p>
        </header>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-destructive">
              Analysis Error
            </h3>
            <p className="text-sm text-destructive/80">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
        {/* Code Editor Section - 70% */}
        <div className="xl:col-span-7">
          <Card title="Code Editor">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <label
                  htmlFor="language-select"
                  className="text-sm font-medium text-foreground shrink-0"
                >
                  Language:
                </label>
                <select
                  id="language-select"
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full sm:w-auto min-w-[140px] px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <CodeEditor
                code={code}
                language={language}
                onChange={handleCodeChange}
              />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground bg-muted px-3 py-2 rounded space-y-2 sm:space-y-0">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>Lines: {getLineCount()}</span>
                  <span>Characters: {getCharacterCount()}</span>
                  {fileName && (
                    <span className="truncate">File: {fileName}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      code.trim() ? "bg-green-500" : "bg-muted-foreground/50"
                    }`}
                  ></span>
                  <span>{code.trim() ? "Ready" : "Empty"}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-3">
          <div className="space-y-6">
            <Card title="Upload File">
              <FileUpload onFileSelect={handleFileSelect} />
            </Card>

            <Card title="Analysis">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    Click the button below to analyze your code for:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Security vulnerabilities</li>
                    <li>Performance issues</li>
                    <li>Best practice violations</li>
                    <li>Refactoring opportunities</li>
                  </ul>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAnalyzeCode}
                  loading={isLoading}
                  disabled={!code.trim() || isLoading}
                  className="w-full"
                >
                  {isLoading ? "Analyzing..." : "Analyze Code"}
                </Button>

                {isLoading && (
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      AI is analyzing your code...
                    </div>
                    <div className="text-xs text-muted-foreground/70">
                      This may take a few seconds
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Tips">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Getting Started:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Paste your code in the editor</li>
                    <li>Or upload a file using drag & drop</li>
                    <li>Select the correct programming language</li>
                    <li>Click "Analyze Code" for instant feedback</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Best Results:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Use complete code snippets</li>
                    <li>Include relevant context</li>
                    <li>Ensure proper syntax</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
});

Home.displayName = "Home";

export default Home;
