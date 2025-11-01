import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Code, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { Button } from './ui/button';

export const Header: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`
        sticky top-0 z-40 w-full bg-background border-b border-border 
        transition-shadow duration-200
        ${isScrolled ? 'shadow-md' : ''}
      `
        .trim()
        .replace(/\s+/g, ' ')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold text-foreground hover:text-blue-600 transition-colors"
              onClick={closeMenu}
            >
              <Code className="h-8 w-8 text-blue-600" />
              <span>CodeReview AI</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`
                px-3 py-2 text-sm font-medium transition-colors rounded-md
                ${
                  location.pathname === '/'
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-950'
                    : 'text-muted-foreground hover:text-blue-600 hover:bg-accent'
                }
              `
                .trim()
                .replace(/\s+/g, ' ')}
              onClick={closeMenu}
            >
              Home
            </Link>

            {isAuthenticated && (
              <Link
                to="/history"
                className={`
                  px-3 py-2 text-sm font-medium transition-colors rounded-md
                  ${
                    location.pathname === '/history'
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-950'
                      : 'text-muted-foreground hover:text-blue-600 hover:bg-accent'
                  }
                `
                  .trim()
                  .replace(/\s+/g, ' ')}
                onClick={closeMenu}
              >
                History
              </Link>
            )}
          </nav>
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              aria-label={`Switch to ${
                theme === 'light' ? 'dark' : 'light'
              } mode`}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-blue-600 transition-colors rounded-md hover:bg-accent">
                  <User className="h-4 w-4" />
                  <span>{user?.email}</span>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-blue-600 transition-colors"
                      onClick={closeMenu}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-red-600 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" onClick={closeMenu}>
                <Button variant="primary" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
          ddw
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-accent rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`
                  block px-3 py-2 text-base font-medium transition-colors rounded-md
                  ${
                    location.pathname === '/'
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-950'
                      : 'text-muted-foreground hover:text-blue-600 hover:bg-accent'
                  }
                `
                  .trim()
                  .replace(/\s+/g, ' ')}
                onClick={closeMenu}
              >
                Home
              </Link>

              {isAuthenticated && (
                <Link
                  to="/history"
                  className={`
                    block px-3 py-2 text-base font-medium transition-colors rounded-md
                    ${
                      location.pathname === '/history'
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-950'
                        : 'text-muted-foreground hover:text-blue-600 hover:bg-accent'
                    }
                  `
                    .trim()
                    .replace(/\s+/g, ' ')}
                  onClick={closeMenu}
                >
                  History
                </Link>
              )}

              <div className="px-3 py-2">
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4" />
                      <span>Light Mode</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-4 border-t border-border mt-4">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Signed in as: {user?.email}
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-2 text-base font-medium text-muted-foreground hover:text-blue-600 hover:bg-accent transition-colors rounded-md"
                      onClick={closeMenu}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2 text-base font-medium text-muted-foreground hover:text-red-600 hover:bg-accent transition-colors rounded-md"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-2">
                    <Link to="/login" onClick={closeMenu}>
                      <Button variant="primary" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
