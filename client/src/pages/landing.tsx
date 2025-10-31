// import { Button } from '@/components/ui/button';
// import { MenuIcon } from 'lucide-react';

import { FAQ, Footer } from '@/components/landing-components';
import useAuthStore from '@/store/authStore';
import { Clock } from 'lucide-react';
import { useEffect } from 'react';

const Landing = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  // Force light mode on this page
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

  return (
    <div>
      <header className="bg-background/60 backdrop-blur-md sticky top-0 z-50 py-2">
        <div className="flex justify-between items-center container mx-auto px-8">
          <h1 className="text-2xl">Criticode</h1>
          {/* <MenuIcon /> */}
          {isAuthenticated ? (
            <div>
              Welcome, {user?.fullName || user?.email}!{' '}
              <button onClick={logout}>Logout</button>
            </div>
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
            <h2
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
            </h2>
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
              Manual code reviews take too long and miss critical issues.
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div>
              <div
                data-slot="card"
                className="text-card-foreground flex flex-col gap-6 rounded-xl border py-6 bg-background border-none shadow-none"
              >
                <div data-slot="card-content" className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="text-primary w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold">
                    Waiting Days for Reviews
                  </h3>
                  <p className="text-muted-foreground">
                    Your pull requests sit idle while teammates juggle their own
                    workload. Development velocity grinds to a halt, and
                    deployment schedules slip. Critical bugs that could've been
                    caught early make it to production.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div
                data-slot="card"
                className="text-card-foreground flex flex-col gap-6 rounded-xl border py-6 bg-background border-none shadow-none"
              >
                <div data-slot="card-content" className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
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
                      className="lucide lucide-zap w-6 h-6 text-primary"
                    >
                      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">
                    Inconsistent Feedback
                  </h3>
                  <p className="text-muted-foreground">
                    Traditional code review processes often lead to varying
                    levels of feedback quality, leaving developers unsure about
                    the effectiveness of their changes.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div
                data-slot="card"
                className="text-card-foreground flex flex-col gap-6 rounded-xl border py-6 bg-background border-none shadow-none"
              >
                <div data-slot="card-content" className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
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
                      className="lucide lucide-shield w-6 h-6 text-primary"
                    >
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Security Risks</h3>
                  <p className="text-muted-foreground">
                    Without thorough reviews, security vulnerabilities can go
                    unnoticed, exposing applications to potential threats and
                    breaches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FAQ />
      <Footer />
    </div>
  );
};

export default Landing;
