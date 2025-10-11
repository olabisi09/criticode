import React from "react";
import { Button } from "../components/ui/Button";

// Test component that throws an error when clicked (only shown in development)
export const ErrorTestComponent: React.FC = () => {
  const [shouldError, setShouldError] = React.useState(false);

  if (shouldError) {
    throw new Error("This is a test error thrown by the ErrorTestComponent");
  }

  // Only render in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="p-4 border-2 border-dashed border-yellow-300 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
      <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
        🧪 Development Mode - Error Boundary Test
      </h3>
      <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
        Click the button below to test the error boundary functionality. This
        component is only visible in development mode.
      </p>
      <Button onClick={() => setShouldError(true)} variant="danger" size="sm">
        Trigger Test Error
      </Button>
    </div>
  );
};
