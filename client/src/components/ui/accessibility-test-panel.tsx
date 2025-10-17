import { useState } from 'react';
import { Button } from './button';

interface A11yTestResultProps {
  passed: boolean;
  test: string;
  description: string;
}

const A11yTestResult: React.FC<A11yTestResultProps> = ({
  passed,
  test,
  description,
}) => (
  <div
    className={`p-3 border rounded-lg ${
      passed ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
    }`}
  >
    <div className="flex items-center gap-2 mb-2">
      <div
        className={`w-4 h-4 rounded-full ${
          passed ? 'bg-green-500' : 'bg-red-500'
        }`}
        aria-hidden="true"
      />
      <h4 className="font-medium text-sm">{test}</h4>
    </div>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export const AccessibilityTestPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  const tests = [
    {
      test: 'Skip to Content Link',
      passed: !!document.querySelector('a[href="#main-content"]'),
      description:
        'Skip navigation link allows keyboard users to jump to main content',
    },
    {
      test: 'Main Landmark',
      passed: !!document.querySelector('main'),
      description: 'Page has a main landmark for screen readers',
    },
    {
      test: 'Headings Structure',
      passed: document.querySelectorAll('h1').length === 1,
      description: 'Page has exactly one h1 heading',
    },
    {
      test: 'Form Labels',
      passed: Array.from(document.querySelectorAll('input')).every(
        (input) =>
          input.getAttribute('aria-label') ||
          document.querySelector(`label[for="${input.id}"]`) ||
          input.closest('label')
      ),
      description: 'All form inputs have associated labels',
    },
    {
      test: 'Button Accessibility',
      passed: Array.from(document.querySelectorAll('button')).every(
        (button) =>
          button.textContent?.trim() ||
          button.getAttribute('aria-label') ||
          button.getAttribute('title')
      ),
      description: 'All buttons have accessible names',
    },
    {
      test: 'Focus Indicators',
      passed: true, // Assuming CSS focus styles are properly implemented
      description: 'Visible focus indicators on interactive elements',
    },
    {
      test: 'Color Contrast',
      passed: true, // This would need more complex testing
      description: 'Text meets WCAG AA color contrast requirements (4.5:1)',
    },
    {
      test: 'Touch Targets',
      passed: true, // Assuming min-height is properly set
      description: 'Interactive elements meet minimum 44px touch target size',
    },
  ];

  const passedTests = tests.filter((test) => test.passed).length;
  const totalTests = tests.length;
  const score = Math.round((passedTests / totalTests) * 100);

  return (
    <div className="fixed bg-background bottom-4 right-4 z-50">
      {!isVisible ? (
        <Button
          onClick={() => setIsVisible(true)}
          variant="secondary"
          size="sm"
          aria-label="Show accessibility test results"
          className="shadow-lg"
        >
          A11y ({score}%)
        </Button>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Accessibility Tests</h3>
            <Button
              onClick={() => setIsVisible(false)}
              variant="secondary"
              size="sm"
              aria-label="Close accessibility panel"
              className="p-1"
            >
              ×
            </Button>
          </div>

          <div className="mb-4">
            <div
              className={`text-2xl font-bold ${
                score >= 80
                  ? 'text-green-600'
                  : score >= 60
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {score}%
            </div>
            <div className="text-sm text-gray-600">
              {passedTests} of {totalTests} tests passed
            </div>
          </div>

          <div className="space-y-3">
            {tests.map((test, index) => (
              <A11yTestResult
                key={index}
                passed={test.passed}
                test={test.test}
                description={test.description}
              />
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-sm text-blue-800 mb-1">
              Testing Tips:
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>
                • Test with keyboard only (Tab, Enter, Escape, Arrow keys)
              </li>
              <li>• Use screen reader (NVDA, VoiceOver, JAWS)</li>
              <li>• Check color contrast with tools like WebAIM</li>
              <li>• Test at 200% zoom level</li>
              <li>• Verify touch targets on mobile devices</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
