import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Page } from '../types';

const VALID_PAGES: Page[] = [
  'home', 'login', 'register', 'dashboard', 'surveys', 'offers', 'offerwalls',
  'wallet', 'rewards', 'withdraw', 'referrals', 'leaderboard', 'profile',
  'settings', 'support', 'privacy', 'terms', 'contact', 'admin',
];

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
  const getInitialPage = (): Page => {
    const state = window.history.state?.page;
    if (state && VALID_PAGES.includes(state)) return state as Page;
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState<Page>(getInitialPage);

  const navigate = (page: Page) => {
    window.history.pushState({ page }, '', '');
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    window.history.back();
  };

  useEffect(() => {
    // Seed initial history entry so back() has somewhere to go
    window.history.replaceState({ page: currentPage }, '', '');

    const handlePopState = (e: PopStateEvent) => {
      const page = e.state?.page;
      if (page && VALID_PAGES.includes(page)) {
        setCurrentPage(page as Page);
        window.scrollTo(0, 0);
      } else {
        setCurrentPage('home');
        window.scrollTo(0, 0);
      }
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
