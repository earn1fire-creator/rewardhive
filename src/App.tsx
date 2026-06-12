import { useEffect } from 'react';
import { RouterProvider, useRouter } from './contexts/RouterContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import DashboardLayout from './components/layout/DashboardLayout';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import SurveysPage from './pages/surveys/SurveysPage';
import OfferwallsPage from './pages/offerwalls/OfferwallsPage';
import WalletPage from './pages/wallet/WalletPage';
import RewardsPage from './pages/rewards/RewardsPage';
import WithdrawPage from './pages/withdraw/WithdrawPage';
import ReferralsPage from './pages/referrals/ReferralsPage';
import LeaderboardPage from './pages/leaderboard/LeaderboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import SupportPage from './pages/support/SupportPage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsOfServicePage from './pages/legal/TermsOfServicePage';
import ContactPage from './pages/contact/ContactPage';
import AdminPage from './pages/admin/AdminPage';

const PROTECTED_PAGES = [
  'dashboard', 'surveys', 'offerwalls', 'wallet', 'rewards',
  'withdraw', 'referrals', 'leaderboard', 'profile', 'settings', 'admin',
];

function AppRouter() {
  const { currentPage, navigate } = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user && PROTECTED_PAGES.includes(currentPage)) {
        navigate('login');
      }
      if (user && (currentPage === 'login' || currentPage === 'register')) {
        navigate('dashboard');
      }
    }
  }, [user, loading, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f18] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading RewardHive...</p>
        </div>
      </div>
    );
  }

  const publicPages = ['home', 'login', 'register', 'privacy', 'terms', 'contact', 'support'];

  if (publicPages.includes(currentPage)) {
    if (currentPage === 'home') return <HomePage />;
    if (currentPage === 'login') return (
      <div className="min-h-screen bg-[#0d0f18]">
        <Header />
        <LoginPage />
      </div>
    );
    if (currentPage === 'register') return (
      <div className="min-h-screen bg-[#0d0f18]">
        <Header />
        <RegisterPage />
      </div>
    );
    if (currentPage === 'privacy') return (
      <div className="min-h-screen bg-[#0d0f18]">
        <Header />
        <PrivacyPolicyPage />
      </div>
    );
    if (currentPage === 'terms') return (
      <div className="min-h-screen bg-[#0d0f18]">
        <Header />
        <TermsOfServicePage />
      </div>
    );
    if (currentPage === 'contact' || currentPage === 'support') return (
      <div className="min-h-screen bg-[#0d0f18]">
        <Header />
        <ContactPage />
      </div>
    );
  }

  return (
    <DashboardLayout>
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'surveys' && <SurveysPage />}
      {currentPage === 'offerwalls' && <OfferwallsPage />}
      {currentPage === 'wallet' && <WalletPage />}
      {currentPage === 'rewards' && <RewardsPage />}
      {currentPage === 'withdraw' && <WithdrawPage />}
      {currentPage === 'referrals' && <ReferralsPage />}
      {currentPage === 'leaderboard' && <LeaderboardPage />}
      {currentPage === 'profile' && <ProfilePage />}
      {currentPage === 'settings' && <SettingsPage />}
      {currentPage === 'admin' && <AdminPage />}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </RouterProvider>
  );
}
