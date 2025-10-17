// import { Button } from '@/components/ui/button';
// import { MenuIcon } from 'lucide-react';

import useAuthStore from '@/store/authStore';

const Landing = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div>
      <header className="bg-background/60 backdrop-blur-md sticky top-0 z-50 py-2">
        <div className="flex justify-between items-center container mx-auto px-8">
          <h1 className="text-2xl">Criticode</h1>
          {/* <MenuIcon /> */}
          {isAuthenticated ? (
            <div>Welcome, {user?.fullName || user?.email}!</div>
          ) : (
            <div className="flex items-center space-x-4">
              <a
                href="/login"
                className="inline-flex text-sm cursor-pointer items-center justify-center px-4 py-2 rounded-md font-medium hover:bg-accent border border-border whitespace-nowrap"
              >
                Sign in
              </a>
              <div
                className="flex w-full max-w-2xl flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
                //style="opacity: 1; transform: none;"
              >
                <a
                  className="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] bg-primary shadow-xs hover:bg-primary/90 h-9 px-4 py-2 w-full sm:w-auto text-background flex gap-2"
                  href="/register"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="h-6 w-6"
                  >
                    <rect width="7" height="7" x="14" y="3" rx="1"></rect>
                    <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"></path>
                  </svg>
                  Get started for free
                </a>
              </div>
            </div>
          )}
        </div>
        <hr className="absolute w-full bottom-0 transition-opacity duration-300 ease-in-out opacity-0" />
      </header>
      <section>
        <div className="flex w-full flex-col items-center justify-start px-4 pt-32 sm:px-6 sm:pt-24 md:pt-32 lg:px-8">
          <a
            href="/blog/introducing-acme-ai"
            className="flex w-auto items-center opacity-[1] transform-none space-x-2 rounded-full bg-primary/20 px-2 py-1 ring-1 ring-accent whitespace-pre"
          >
            <div className="w-fit rounded-full bg-accent px-2 py-0.5 text-center text-xs font-medium text-primary sm:text-sm">
              📣 Announcement
            </div>
            <p className="text-xs font-medium text-primary sm:text-sm">
              Introducing Criticode
            </p>
            <svg
              width="12"
              height="12"
              className="ml-1"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.78141 5.33312L5.20541 1.75712L6.14808 0.814453L11.3334 5.99979L6.14808 11.1851L5.20541 10.2425L8.78141 6.66645H0.666748V5.33312H8.78141Z"
                fill="hsl(var(--primary))"
              ></path>
            </svg>
          </a>
          <div className="flex w-full max-w-2xl flex-col space-y-4 overflow-hidden pt-8">
            <h1
              className="text-center text-4xl font-medium leading-tight text-foreground sm:text-5xl md:text-6xl"
              //style="filter: blur(0px); opacity: 1; transform: none;"
            >
              <span
                className="inline-block px-1 md:px-2 text-balance font-semibold"
                //style="opacity: 1; transform: none;"
              >
                Improve
              </span>
              <span
                className="inline-block px-1 md:px-2 text-balance font-semibold"
                //style="opacity: 1; transform: none;"
              >
                your
              </span>
              {/* <span
                className="inline-block px-1 md:px-2 text-balance font-semibold"
                //style="opacity: 1; transform: none;"
              >
                code
              </span> */}
              <span
                className="inline-block px-1 md:px-2 text-balance font-semibold"
                ///style="opacity: 1; transform: none;"
              >
                code with AI
              </span>
            </h1>
            <p
              className="mx-auto max-w-xl text-center text-lg leading-7 text-muted-foreground sm:text-xl sm:leading-9 text-balance"
              //style="opacity: 1; transform: none;"
            >
              Get instant, intelligent feedback on your code.
            </p>
          </div>
          <div
            className="mx-auto mt-6 flex w-full max-w-2xl flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
            //style="opacity: 1; transform: none;"
          >
            <a
              className="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[&gt;svg]:px-3 w-full sm:w-auto text-background flex gap-2"
              href="/register"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="h-6 w-6"
              >
                <rect width="7" height="7" x="14" y="3" rx="1"></rect>
                <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"></path>
              </svg>
              Get started for free
            </a>
          </div>
        </div>
      </section>
      <section id="problem">
        <div className="relative container mx-auto px-4 py-16 max-w-7xl">
          <div className="text-center space-y-4 pb-6 mx-auto">
            <h2 className="text-sm text-primary font-mono font-medium tracking-wider uppercase">
              Problem
            </h2>
            <h3 className="mx-auto mt-4 max-w-xs text-3xl font-semibold sm:max-w-none sm:text-4xl md:text-5xl">
              Staying on top of quality code is hard.
            </h3>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
