import { Outlet } from 'react-router-dom';
import { Navigation } from '../ui/navigation';

const AuthLayout: React.FC = () => {
  return (
    <>
      <Navigation />
      <main
        role="main"
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8"
      >
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default AuthLayout;
