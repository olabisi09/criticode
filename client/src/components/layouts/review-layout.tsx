import { ChevronDown, History, Home, Moon } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../../contexts';
import { NavLink, Outlet } from 'react-router-dom';

const ReviewLayout = () => {
  const { toggleTheme } = useTheme();
  return (
    <div className="flex h-screen w-full">
      <aside className="h-screen fixed top-0 left-0 z-50 bg-background border-r border-black/[7%] w-[15rem]">
        <div className="flex items-center gap-2 px-4 h-18 border-b border-b-black/[7%]">
          <div className="bg-accent text-accent-foreground w-12 h-12 rounded-md flex items-center justify-center font-bold">
            C
          </div>
          <div>
            <h1 className="font-medium">Olabisi</h1>
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  Options
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Hey</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>
        </div>
        <section className="p-4">
          <ul className="font-medium *:cursor-pointer">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 rounded py-2 ${
                    isActive
                      ? 'bg-nav-background font-semibold'
                      : 'hover:bg-nav-background'
                  }`
                }
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 rounded py-2 ${
                    isActive
                      ? 'bg-nav-background font-semibold'
                      : 'hover:bg-nav-background'
                  }`
                }
              >
                <History className="w-4 h-4" />
                <span>Review History</span>
              </NavLink>
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
        <div className="p-4 mt-18 bg-background">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ReviewLayout;
