import { History, Home, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../contexts';
import { Outlet } from 'react-router-dom';

const ReviewLayout = () => {
  const { toggleTheme } = useTheme();
  return (
    <div className="flex h-screen w-full">
      <aside className="h-screen fixed top-0 left-0 z-50 border-r border-black/[7%] w-[15rem]">
        <h1 className="text-4xl font-bold h-18 border-b border-b-black/[7%]">
          Criticode
        </h1>
        <section className="p-4">
          <ul className="font-medium *:cursor-pointer">
            <li className="flex items-center gap-2 px-2 hover:bg-nav-background rounded py-2">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </li>
            <li className="flex items-center gap-2 px-2 hover:bg-nav-background rounded py-2">
              <History className="w-4 h-4" />
              <span>Review History</span>
            </li>
          </ul>
        </section>
      </aside>
      <div className="w-full pl-[15rem]">
        <header className="fixed top-0 left-[15rem] z-50 w-[calc(100vw-15rem)] bg-background h-18 border-b border-b-black/[7%] px-4 flex justify-between items-center">
          <h3>Analyze Code</h3>
          <Button onClick={toggleTheme} className="border-border bg-black">
            <Moon />
          </Button>
        </header>
        <div className="p-4 mt-18">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ReviewLayout;
