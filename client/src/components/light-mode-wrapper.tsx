import { useEffect, ReactNode } from 'react';

interface LightModeWrapperProps {
  children: ReactNode;
}

const LightModeWrapper = ({ children }: LightModeWrapperProps) => {
  useEffect(() => {
    const root = document.documentElement;
    const originalTheme = root.classList.contains('dark') ? 'dark' : 'light';
    
    // Force light mode
    root.classList.remove('dark');
    root.classList.add('light');
    
    // Cleanup: restore original theme when component unmounts
    return () => {
      root.classList.remove('light');
      if (originalTheme === 'dark') {
        root.classList.add('dark');
      }
    };
  }, []);

  return <>{children}</>;
};

export default LightModeWrapper;
