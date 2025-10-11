import React, { useState } from "react";
import { Copy, CheckCircle } from "lucide-react";
import Editor from "@monaco-editor/react";

interface CodeExampleProps {
  code: string;
  language?: string;
  title?: string;
  showDiff?: boolean;
  beforeCode?: string;
  afterCode?: string;
  maxHeight?: string;
  className?: string;
}

export const CodeExample: React.FC<CodeExampleProps> = ({
  code,
  language = "text",
  title,
  showDiff = false,
  beforeCode,
  afterCode,
  maxHeight = "300px",
  className = "",
}) => {
  const [copied, setCopied] = useState(false);
  const [diffView, setDiffView] = useState<"before" | "after">("before");

  const copyToClipboard = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const getCurrentCode = () => {
    if (showDiff) {
      return diffView === "before" ? beforeCode || "" : afterCode || "";
    }
    return code;
  };

  const renderSimpleCodeBlock = () => {
    return (
      <div
        className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}
      >
        {/* Header */}
        {(title || showDiff) && (
          <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
            <div className="flex items-center space-x-4">
              {title && (
                <h3 className="text-sm font-medium text-gray-200">{title}</h3>
              )}

              {showDiff && (beforeCode || afterCode) && (
                <div className="flex bg-gray-700 rounded-md p-0.5">
                  <button
                    onClick={() => setDiffView("before")}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      diffView === "before"
                        ? "bg-red-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-600"
                    }`}
                  >
                    Before
                  </button>
                  <button
                    onClick={() => setDiffView("after")}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      diffView === "after"
                        ? "bg-green-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-600"
                    }`}
                  >
                    After
                  </button>
                </div>
              )}
            </div>

            {/* Copy Button */}
            <button
              onClick={() => copyToClipboard(getCurrentCode())}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Copy code"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        )}

        {/* Code Content */}
        <div className="overflow-auto text-sm" style={{ maxHeight }}>
          <pre className="p-4 text-gray-100 leading-relaxed">
            <code>{getCurrentCode()}</code>
          </pre>
        </div>

        {/* Copy Button (when no header) */}
        {!title && !showDiff && (
          <button
            onClick={() => copyToClipboard(getCurrentCode())}
            className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors"
            title="Copy code"
          >
            {copied ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    );
  };

  const renderMonacoEditor = () => {
    return (
      <div
        className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}
      >
        {/* Header */}
        {(title || showDiff) && (
          <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
            <div className="flex items-center space-x-4">
              {title && (
                <h3 className="text-sm font-medium text-gray-200">{title}</h3>
              )}

              {showDiff && (beforeCode || afterCode) && (
                <div className="flex bg-gray-700 rounded-md p-0.5">
                  <button
                    onClick={() => setDiffView("before")}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      diffView === "before"
                        ? "bg-red-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-600"
                    }`}
                  >
                    Before
                  </button>
                  <button
                    onClick={() => setDiffView("after")}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      diffView === "after"
                        ? "bg-green-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-600"
                    }`}
                  >
                    After
                  </button>
                </div>
              )}
            </div>

            {/* Copy Button */}
            <button
              onClick={() => copyToClipboard(getCurrentCode())}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Copy code"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        )}

        {/* Monaco Editor */}
        <div className="relative">
          <Editor
            height={maxHeight}
            language={language}
            value={getCurrentCode()}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
              folding: false,
              glyphMargin: false,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 3,
              renderLineHighlight: "none",
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
              },
            }}
            loading={
              <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
                Loading...
              </div>
            }
          />

          {/* Copy Button (when no header) */}
          {!title && !showDiff && (
            <button
              onClick={() => copyToClipboard(getCurrentCode())}
              className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors z-10"
              title="Copy code"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Determine whether to use Monaco or simple code block
  // Use Monaco for supported languages, simple block for others
  const supportedLanguages = [
    "javascript",
    "typescript",
    "python",
    "java",
    "cpp",
    "go",
    "ruby",
    "php",
    "html",
    "css",
    "json",
    "xml",
    "yaml",
  ];

  const useMonaco = supportedLanguages.includes(language.toLowerCase());

  return useMonaco ? renderMonacoEditor() : renderSimpleCodeBlock();
};

export default CodeExample;
