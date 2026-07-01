import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Page } from '../types';

const VALID_PAGES: Page[] = [
  'home', 'login', 'register', 'dashboard', 'surveys', 'offerwalls',
  'capsbit-page', 'withdraw', 'referrals', 'leaderboard', 'profile',
  'settings', 'support', 'privacy', 'terms', 'contact', 'admin',
  'success', 'overquota', 'terminate', 'security-terminate',
];

const PAGE_TO_PATH: Record<Page, string> = {
  home:                '/',
  login:               '/login',
  register:            '/register',
  dashboard:           '/dashboard',
  surveys:             '/surveys',
  offerwalls:          '/offerwalls',
  'capsbit-page':      '/capsbit',
  withdraw:            '/withdraw',
  referrals:           '/referrals',
  leaderboard:         '/leaderboard',
  profile:             '/profile',
  settings:            '/settings',
  support:             '/support',
  privacy:             '/privacy',
  terms:               '/terms',
  contact:             '/contact',
  admin:               '/admin',
  success:             '/success',
  overquota:           '/overquota',
  terminate:           '/terminate',
  'security-terminate': '/security-terminate',
};

const PATH_TO_PAGE: Record<string, Page> = Object.fromEntries(
  Object.entries(PAGE_TO_PATH).map(([page, path]) => [path, page as Page])
);

function pathToPage(pathname: string): Page {
  const page = PATH_TO_PAGE[pathname];
  if (page && VALID_PAGES.includes(page)) return page;
  return 'home';
}

interface RouterContextType {
  currentPage: Page;
  navigate: (page: Page) => void;
  goBack: () => void;
}

const RouterContext = createContext<RouterContextType>({
  currentPage: 'home',
  navigate: () => {},
  goBack: () => {},
});

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    return pathToPage(window.location.pathname);
  });

  const navigate = (page: Page) => {
    const path = PAGE_TO_PATH[page];
    window.history.pushState({ page }, '', path);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    window.history.back();
  };

  useEffect(() => {
    // Seed the current history entry with the page name
    const path = PAGE_TO_PATH[currentPage];
    window.history.replaceState({ page: currentPage }, '', path);

    const handlePopState = (e: PopStateEvent) => {
      const page = e.state?.page as Page | undefined;
      const resolved = page && VALID_PAGES.includes(page)
        ? page
        : pathToPage(window.location.pathname);
      setCurrentPage(resolved);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ currentPage, navigate, goBack }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}
