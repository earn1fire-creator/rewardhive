import { useEffect } from 'react';
import { RouterProvider, useRouter } from './contexts/RouterContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/layout/Header';
import DashboardLayout from './components/layout/DashboardLayout';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import SurveysPage from './pages/surveys/SurveysPage';
import OfferwallsPage from './pages/offerwalls/OfferwallsPage';
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
import SurveySuccessPage from './pages/surveys/SurveySuccessPage';
import SurveyOverquotaPage from './pages/surveys/SurveyOverquotaPage';
import SurveyTerminatePage from './pages/surveys/SurveyTerminatePage';
import SurveySecurityTerminatePage from './pages/surveys/SurveySecurityTerminatePage';

const PROTECTED_PAGES = [
  'dashboard', 'surveys', 'offerwalls',
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
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d0f18] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading RewardHive...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'home') return <HomePage />;

  const withHeader = (children: React.ReactNode) => (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0f18]">
      <Header />
      {children}
    </div>
  );

  if (currentPage === 'login') return withHeader(<LoginPage />);
  if (currentPage === 'register') return withHeader(<RegisterPage />);
  if (currentPage === 'privacy') return withHeader(<PrivacyPolicyPage />);
  if (currentPage === 'terms') return withHeader(<TermsOfServicePage />);
  if (currentPage === 'contact') return withHeader(<ContactPage />);
  if (currentPage === 'support') return withHeader(<SupportPage />);
  if (currentPage === 'success') return withHeader(<SurveySuccessPage />);
  if (currentPage === 'overquota') return withHeader(<SurveyOverquotaPage />);
  if (currentPage === 'terminate') return withHeader(<SurveyTerminatePage />);
  if (currentPage === 'security-terminate') return withHeader(<SurveySecurityTerminatePage />);

  return (
    <DashboardLayout>
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'surveys' && <SurveysPage />}
      {currentPage === 'offerwalls' && <OfferwallsPage />}
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
      <ThemeProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ThemeProvider>
    </RouterProvider>
  );
}
