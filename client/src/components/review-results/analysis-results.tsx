import React, { useState, useCallback, useMemo } from 'react';
import { Copy, CheckCircle, MapPin } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import type { AnalysisResult, SecurityIssue } from '../../types';

interface AnalysisResultsProps {
  analysisResult: AnalysisResult;
  onLineClick?: (lineNumber: number) => void;
}

type TabType = 'security' | 'performance' | 'bestPractices' | 'refactoring';

const tabLabels = {
  security: 'Security',
  performance: 'Performance',
  bestPractices: 'Best Practices',
  refactoring: 'Refactoring',
};

// Severity color mapping for security issues
const severityVariants: Record<
  SecurityIssue['severity'],
  'error' | 'warning' | 'info'
> = {
  Critical: 'error',
  High: 'error',
  Medium: 'warning',
  Low: 'info',
};

export const AnalysisResults: React.FC<AnalysisResultsProps> = React.memo(
  ({ analysisResult, onLineClick }) => {
    const [activeTab, setActiveTab] = useState<TabType>('security');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Memoized clipboard copy function
    const copyToClipboard = useCallback(async (code: string, id: string) => {
      try {
        await navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }, []);

    // Memoized line click handler
    const handleLineClick = useCallback(
      (lineNumber: number) => {
        if (onLineClick) {
          onLineClick(lineNumber);
        } else {
          // Fallback behavior
          console.log(`Navigate to line ${lineNumber}`);
        }
      },
      [onLineClick]
    );

    // Memoized tab counts
    const tabCounts = useMemo(
      () => ({
        security: analysisResult.security?.length || 0,
        performance: analysisResult.performance?.length || 0,
        bestPractices: analysisResult.bestPractices?.length || 0,
        refactoring: analysisResult.refactoring?.length || 0,
      }),
      [analysisResult]
    );

    const renderSecurityIssues = () => {
      const issues = analysisResult.security;

      if (issues.length === 0) {
        return (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-lg font-medium">No security issues found!</p>
            <p className="text-sm">Your code looks secure.</p>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {issues.map((issue, index) => (
            <Card key={index} className="border-l-4 border-l-red-500">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={severityVariants[issue.severity]}>
                        {issue.severity}
                      </Badge>
                      <button
                        onClick={() => handleLineClick(issue.line)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <MapPin className="h-3 w-3" />
                        Line {issue.line}
                      </button>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {issue.issue}
                    </h3>
                    <p className="text-gray-600 text-sm">{issue.description}</p>
                  </div>
                </div>

                {/* Fix Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Recommended Fix:
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">{issue.fix}</p>

                  {/* Code Example */}
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                      <code>{issue.codeExample}</code>
                    </pre>
                    <button
                      onClick={() =>
                        copyToClipboard(issue.codeExample, `security-${index}`)
                      }
                      className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors"
                      title="Copy code"
                    >
                      {copiedCode === `security-${index}` ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      );
    };

    const renderPerformanceIssues = () => {
      const issues = analysisResult.performance;

      if (issues.length === 0) {
        return (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-lg font-medium">No performance issues found!</p>
            <p className="text-sm">Your code is well optimized.</p>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {issues.map((issue, index) => (
            <Card key={index} className="border-l-4 border-l-orange-500">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => handleLineClick(issue.line)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <MapPin className="h-3 w-3" />
                        Line {issue.line}
                      </button>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {issue.issue}
                    </h3>
                    <p className="text-gray-600 text-sm">{issue.description}</p>
                  </div>
                </div>

                {/* Suggestion Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Performance Suggestion:
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    {issue.suggestion}
                  </p>

                  {/* Code Example */}
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                      <code>{issue.codeExample}</code>
                    </pre>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          issue.codeExample,
                          `performance-${index}`
                        )
                      }
                      className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors"
                      title="Copy code"
                    >
                      {copiedCode === `performance-${index}` ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      );
    };

    const renderBestPracticeIssues = () => {
      const issues = analysisResult.bestPractices;

      if (issues.length === 0) {
        return (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-lg font-medium">
              No best practice issues found!
            </p>
            <p className="text-sm">Your code follows good practices.</p>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {issues.map((issue, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => handleLineClick(issue.line)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <MapPin className="h-3 w-3" />
                        Line {issue.line}
                      </button>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {issue.issue}
                    </h3>
                    <p className="text-gray-600 text-sm">{issue.description}</p>
                  </div>
                </div>

                {/* Suggestion Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Best Practice Suggestion:
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    {issue.suggestion}
                  </p>

                  {/* Code Example */}
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                      <code>{issue.codeExample}</code>
                    </pre>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          issue.codeExample,
                          `bestpractice-${index}`
                        )
                      }
                      className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors"
                      title="Copy code"
                    >
                      {copiedCode === `bestpractice-${index}` ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      );
    };

    const renderRefactoringOpportunities = () => {
      const opportunities = analysisResult.refactoring;

      if (opportunities.length === 0) {
        return (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-lg font-medium">
              No refactoring opportunities found!
            </p>
            <p className="text-sm">Your code structure looks good.</p>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {opportunities.map((opportunity, index) => (
            <Card key={index} className="border-l-4 border-l-green-500">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => handleLineClick(opportunity.line)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <MapPin className="h-3 w-3" />
                        Line {opportunity.line}
                      </button>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {opportunity.opportunity}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {opportunity.description}
                    </p>
                  </div>
                </div>

                {/* Benefit Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Refactoring Benefit:
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    {opportunity.benefit}
                  </p>

                  {/* Code Example */}
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                      <code>{opportunity.codeExample}</code>
                    </pre>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          opportunity.codeExample,
                          `refactoring-${index}`
                        )
                      }
                      className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors"
                      title="Copy code"
                    >
                      {copiedCode === `refactoring-${index}` ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      );
    };

    const renderTabContent = () => {
      switch (activeTab) {
        case 'security':
          return renderSecurityIssues();
        case 'performance':
          return renderPerformanceIssues();
        case 'bestPractices':
          return renderBestPracticeIssues();
        case 'refactoring':
          return renderRefactoringOpportunities();
        default:
          return null;
      }
    };

    return (
      <div className="w-full">
        {/* Summary Section */}
        <Card title="Analysis Summary" className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {analysisResult.security.length}
              </div>
              <div className="text-sm text-red-600 font-medium">
                Security Issues
              </div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {analysisResult.performance.length}
              </div>
              <div className="text-sm text-orange-600 font-medium">
                Performance Issues
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analysisResult.bestPractices.length}
              </div>
              <div className="text-sm text-blue-600 font-medium">
                Best Practices
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analysisResult.refactoring.length}
              </div>
              <div className="text-sm text-green-600 font-medium">
                Refactoring
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {(Object.keys(tabLabels) as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `
                  .trim()
                  .replace(/\s+/g, ' ')}
              >
                {tabLabels[tab]}
                {(() => {
                  const count = analysisResult[tab].length;
                  return count > 0 ? (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        activeTab === tab
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {count}
                    </span>
                  ) : null;
                })()}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">{renderTabContent()}</div>
      </div>
    );
  }
);

AnalysisResults.displayName = 'AnalysisResults';

export default AnalysisResults;
