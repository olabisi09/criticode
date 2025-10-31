import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: {
    fileName: string;
    content: string;
    language: string;
  }) => void;
  acceptedExtensions?: string[];
}

// Default accepted extensions with their corresponding languages
const defaultExtensions = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.py',
  '.java',
  '.cpp',
  '.c',
  '.h',
  '.go',
  '.rb',
  '.php',
  '.cs',
  '.swift',
  '.kt',
  '.dart',
  '.rs',
  '.scala',
];

// Map file extensions to languages
const extensionToLanguage: Record<string, string> = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.java': 'java',
  '.cpp': 'cpp',
  '.c': 'cpp',
  '.h': 'cpp',
  '.go': 'go',
  '.rb': 'ruby',
  '.php': 'php',
  '.cs': 'csharp',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.dart': 'dart',
  '.rs': 'rust',
  '.scala': 'scala',
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedExtensions = defaultExtensions,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Maximum file size (2MB)
      const MAX_FILE_SIZE = 2 * 1024 * 1024;
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return `File size must be less than 2MB. Current size: ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB`;
      }

      // Check file extension
      const extension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf('.'));
      if (!acceptedExtensions.includes(extension)) {
        return `File type "${extension}" is not supported. Accepted types: ${acceptedExtensions.join(
          ', '
        )}`;
      }

      return null;
    },
    [acceptedExtensions]
  );

  const detectLanguage = useCallback((fileName: string): string => {
    const extension = fileName
      .toLowerCase()
      .substring(fileName.lastIndexOf('.'));
    return extensionToLanguage[extension] || 'text';
  }, []);

  const readFileContent = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsText(file);
    });
  }, []);

  const handleFileProcess = useCallback(
    async (file: File) => {
      setError(null);
      setIsLoading(true);

      try {
        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }

        // Read file content
        const content = await readFileContent(file);
        const language = detectLanguage(file.name);

        // Set selected file name
        setSelectedFile(file.name);

        // Call parent callback
        onFileSelect({
          fileName: file.name,
          content,
          language,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process file');
      } finally {
        setIsLoading(false);
      }
    },
    [validateFile, readFileContent, detectLanguage, onFileSelect]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileProcess(files[0]);
      }
    },
    [handleFileProcess]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileProcess(files[0]);
      }
    },
    [handleFileProcess]
  );

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 min-h-[200px] flex flex-col items-center justify-center
          ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${isLoading ? 'cursor-not-allowed opacity-50' : ''}
        `
          .trim()
          .replace(/\s+/g, ' ')}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={acceptedExtensions.join(',')}
          disabled={isLoading}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
            <p className="text-sm text-gray-600">Processing file...</p>
          </div>
        ) : (
          <>
            <Upload
              className={`h-12 w-12 mb-4 ${
                isDragOver ? 'text-blue-500' : 'text-gray-400'
              }`}
            />
            <p
              className={`text-lg font-medium mb-2 ${
                isDragOver ? 'text-blue-700' : 'text-gray-700'
              }`}
            >
              {isDragOver
                ? 'Drop file here'
                : 'Drag file here or click to browse'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports: {acceptedExtensions.join(', ')}
            </p>
            <p className="text-xs text-gray-400">Maximum file size: 2MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Upload Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {selectedFile && !error && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <File className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  File uploaded successfully
                </p>
                <p className="text-sm text-green-600">{selectedFile}</p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
              aria-label="Clear file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p className="font-medium mb-1">Supported file types:</p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {acceptedExtensions.map((ext) => (
            <span
              key={ext}
              className="px-2 py-1 bg-gray-100 rounded text-center"
            >
              {ext}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
