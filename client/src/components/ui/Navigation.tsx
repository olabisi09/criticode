import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Home, History, User, LogOut, LogIn, Sun, Moon } from 'lucide-react';
import { Button } from './Button';
import { useTheme } from '../../hooks/useTheme';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
  };

  const navigationItems = [
    {
      path: '/',
      label: 'Home',
      icon: Home,
      public: true,
    },
    {
      path: '/history',
      label: 'History',
      icon: History,
      public: false,
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: User,
      public: false,
    },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="bg-card border-b border-border px-4 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-primary hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
          aria-label="CritiCode - Go to home page"
        >
          CritiCode
        </Link>

        {/* Main Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          <ul className="flex items-center space-x-1" role="menubar">
            {navigationItems.map((item) => {
              if (!item.public && !isAuthenticated) return null;

              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.path} role="none">
                  <Link
                    to={item.path}
                    role="menuitem"
                    className={`
                      inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                      transition-colors duration-200 min-h-[44px]
                      focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                      ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }
                    `
                      .trim()
                      .replace(/\s+/g, ' ')}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleTheme}
            aria-label={`Switch to ${
              theme === 'light' ? 'dark' : 'light'
            } theme`}
            className="p-2"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Sun className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span
                className="text-sm text-muted-foreground hidden sm:inline"
                aria-label={`Logged in as ${user?.fullName || user?.email}`}
              >
                {user?.fullName || user?.email}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                aria-label="Sign out"
                className="inline-flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button
                variant="primary"
                size="sm"
                aria-label="Sign in to your account"
                className="inline-flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="secondary"
            size="sm"
            aria-label="Open mobile navigation menu"
            aria-expanded="false"
            aria-controls="mobile-menu"
            className="p-2"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile Menu (placeholder for future implementation) */}
      <div id="mobile-menu" className="md:hidden hidden" role="menu">
        {/* Mobile navigation items would go here */}
      </div>
    </nav>
  );
};
