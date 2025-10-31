import React, { lazy } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load Monaco Editor
const MonacoEditor = lazy(() => import('@monaco-editor/react'));

// Editor loading component
const EditorLoading: React.FC<{ height?: string }> = ({ height = '350px' }) => (
  <div
    className={`flex items-center justify-center w-full bg-muted border border-border rounded-lg`}
    style={{ height }}
  >
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">Loading editor...</span>
    </div>
  </div>
);

// Editor options interface
interface EditorOptions {
  minimap: { enabled: boolean };
  fontSize: number;
  lineNumbers: 'on' | 'off';
  scrollBeyondLastLine: boolean;
  readOnly: boolean;
  automaticLayout: boolean;
  wordWrap: 'on' | 'off';
  tabSize: number;
  insertSpaces: boolean;
  folding: boolean;
  showFoldingControls: 'always' | 'never' | 'mouseover';
  bracketPairColorization: { enabled: boolean };
  lineHeight?: number;
}

// Memoized Monaco Editor component
const MemoizedMonacoEditor = React.memo<{
  height: string;
  language: string;
  value: string;
  theme: 'vs-dark' | 'light';
  onChange: (value: string | undefined) => void;
  options: EditorOptions;
}>(({ height, language, value, theme, onChange, options }) => (
  <MonacoEditor
    height={height}
    language={language}
    value={value}
    theme={theme}
    onChange={onChange}
    options={options}
    loading={<EditorLoading height={height} />}
  />
));

MemoizedMonacoEditor.displayName = 'MemoizedMonacoEditor';

export { EditorLoading, MemoizedMonacoEditor };
