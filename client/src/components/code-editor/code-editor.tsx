import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from 'react';
import { useTheme } from '../../hooks/useTheme';
import { EditorLoading, MemoizedMonacoEditor } from './lazy-monaco-editor';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

// Supported languages with display names
const supportedLanguages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
];

// Memoized CodeEditor component for performance
export const CodeEditor: React.FC<CodeEditorProps> = React.memo(
  ({ code, language, onChange, readOnly = false }) => {
    const { theme: appTheme } = useTheme();
    const [monacoTheme, setMonacoTheme] = useState<'vs-dark' | 'light'>(
      'vs-dark'
    );
    const [selectedLanguage, setSelectedLanguage] = useState(language);

    // Update Monaco theme when app theme changes
    useEffect(() => {
      setMonacoTheme(appTheme === 'dark' ? 'vs-dark' : 'light');
    }, [appTheme]);

    // Update language when prop changes
    useEffect(() => {
      setSelectedLanguage(language);
    }, [language]);

    // Memoized language change handler
    const handleLanguageChange = useCallback((newLanguage: string) => {
      setSelectedLanguage(newLanguage);
    }, []);

    // Memoized editor change handler
    const handleEditorChange = useCallback(
      (value: string | undefined) => {
        if (value !== undefined) {
          onChange?.(value);
        }
      },
      [onChange]
    );

    // Memoized editor options
    const editorOptions = useMemo(
      () => ({
        minimap: { enabled: false },
        fontSize: window.innerWidth < 640 ? 12 : 14,
        lineNumbers: 'on' as const,
        scrollBeyondLastLine: false,
        readOnly,
        automaticLayout: true,
        wordWrap: 'on' as const,
        tabSize: 2,
        insertSpaces: true,
        folding: true,
        showFoldingControls: 'always' as const,
        bracketPairColorization: {
          enabled: true,
        },
        lineHeight: window.innerWidth < 640 ? 18 : 21,
      }),
      [readOnly]
    );

    // Memoized editor height
    const editorHeight = useMemo(() => {
      if (window.innerWidth < 640) return '350px';
      if (window.innerWidth < 768) return '400px';
      if (window.innerWidth < 1024) return '450px';
      return '500px';
    }, []);

    return (
      <div className="w-full">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <label
              htmlFor="language-select"
              className="text-sm font-medium text-foreground"
            >
              Language:
            </label>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={readOnly}
              className="
              w-full sm:w-auto min-w-[140px] px-3 py-2 text-sm border border-input rounded-md 
              bg-background text-foreground 
              focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
              disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-50
              transition-colors duration-200
            "
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <span className="text-sm font-medium text-foreground">Theme:</span>
            <span className="px-3 py-2 text-sm border border-input rounded-md bg-muted text-muted-foreground self-start sm:self-auto">
              {monacoTheme === 'vs-dark' ? 'Dark' : 'Light'}
            </span>
          </div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <Suspense fallback={<EditorLoading height={editorHeight} />}>
            <MemoizedMonacoEditor
              height={editorHeight}
              language={selectedLanguage}
              value={code}
              theme={monacoTheme}
              onChange={handleEditorChange}
              options={editorOptions}
            />
          </Suspense>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Lines: {code.split('\n').length} | Characters: {code.length}
          </div>
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                code.trim() ? 'bg-green-500' : 'bg-muted-foreground/50'
              }`}
            ></span>
            <span>{code.trim() ? 'Ready' : 'Empty'}</span>
          </div>
          {readOnly && (
            <div className="flex items-center space-x-1">
              <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span>Read-only</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;
