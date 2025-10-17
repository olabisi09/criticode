import { History, Home, Moon } from 'lucide-react';
import { useTheme } from '../contexts';
import { Button } from '@/components/ui/button';

const Freestyle = () => {
  const { toggleTheme } = useTheme();
  return (
    <div className="flex h-screen w-full">
      <aside className="h-screen border-r border-black/[7%] w-[20rem]">
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
      <div className="w-full">
        <header className="w-full h-18 border-b border-b-black/[7%] px-4 flex justify-between items-center">
          <h3>Analyze Code</h3>
          <Button onClick={toggleTheme} className="border-border">
            <Moon />
          </Button>
        </header>
      </div>
    </div>
  );
};

export default Freestyle;
