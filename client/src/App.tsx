import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, Suspense } from 'react';
import {
  Home,
  History,
  Login,
  Profile,
  NotFound,
  ReviewDetail,
  Freestyle,
  Register,
  Landing,
} from './pages';
import { ProtectedRoute } from './components/protected-route';
import { useTheme } from './hooks/useTheme';
import { Spinner } from './components/ui/spinner';
import { AccessibilityTestPanel } from './components/ui/accessibility-test-panel';
import ReviewLayout from './components/layouts/review-layout';
import AuthLayout from './components/layouts/auth-layout';

function App() {
  const { theme } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        {/* Skip to content link for screen readers */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 
                     bg-primary text-primary-foreground px-4 py-2 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Skip to main content
        </a>

        <Suspense
          fallback={
            <div
              role="status"
              aria-label="Loading page content"
              className="flex items-center justify-center min-h-screen"
            >
              <Spinner />
              <span className="sr-only">Loading...</span>
            </div>
          }
        >
          <main id="main-content" role="main">
            <Routes>
              <Route element={<ReviewLayout />}>
                <Route path="/" element={<Home />} />
              </Route>
              <Route path="/freestyle" element={<Freestyle />} />
              <Route path="/landing" element={<Landing />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/history" element={<History />} />
                <Route path="/history/:id" element={<ReviewDetail />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </Suspense>

        {/* Accessibility Testing Panel (Development Only) */}
        <AccessibilityTestPanel />
      </div>
    </BrowserRouter>
  );
}

export default App;
