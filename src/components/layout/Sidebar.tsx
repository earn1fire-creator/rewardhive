import {
  LayoutDashboard,
  ClipboardList,
  Layers,
  Gift,
  Sparkles,
  Wallet,
  ArrowUpRight,
  Users,
  Trophy,
  User,
  Settings,
  HelpCircle,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { useRouter } from '../../contexts/RouterContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Page } from '../../types';

const NAV_ITEMS: { label: string; page: Page; icon: React.ReactNode }[] = [
  { label: 'Dashboard', page: 'dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Surveys', page: 'surveys', icon: <ClipboardList size={18} /> },
  { label: 'Offers', page: 'offers', icon: <Sparkles size={18} /> },
  { label: 'Offerwalls', page: 'offerwalls', icon: <Layers size={18} /> },
  { label: 'Rewards', page: 'rewards', icon: <Gift size={18} /> },
  { label: 'Wallet', page: 'wallet', icon: <Wallet size={18} /> },
  { label: 'Withdraw', page: 'withdraw', icon: <ArrowUpRight size={18} /> },
  { label: 'Referrals', page: 'referrals', icon: <Users size={18} /> },
  { label: 'Leaderboard', page: 'leaderboard', icon: <Trophy size={18} /> },
  { label: 'Profile', page: 'profile', icon: <User size={18} /> },
  { label: 'Settings', page: 'settings', icon: <Settings size={18} /> },
  { label: 'Support', page: 'support', icon: <HelpCircle size={18} /> },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { currentPage, navigate } = useRouter();
  const { profile } = useAuth();

  const handleNav = (page: Page) => {
    navigate(page);
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-14 left-0 bottom-0 w-60 bg-white dark:bg-[#0d0f18] border-r border-gray-200 dark:border-[#2a2e45] z-40
          flex flex-col
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo section visible on mobile */}
        <div className="flex items-center gap-2 px-4 py-4 lg:hidden border-b border-gray-200 dark:border-[#2a2e45]">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">RewardHive</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-0.5">
            {NAV_ITEMS.map(({ label, page, icon }) => (
              <button
                key={page}
                onClick={() => handleNav(page)}
                className={`sidebar-link w-full ${currentPage === page ? 'active' : ''}`}
              >
                <span className={currentPage === page ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}>
                  {icon}
                </span>
                {label}
              </button>
            ))}

            {profile?.is_admin && (
              <>
                <div className="border-t border-gray-200 dark:border-[#2a2e45] my-2" />
                <button
                  onClick={() => handleNav('admin')}
                  className={`sidebar-link w-full ${currentPage === 'admin' ? 'active' : ''}`}
                >
                  <span className={currentPage === 'admin' ? 'text-blue-500 dark:text-blue-400' : 'text-blue-500/60'}>
                    <ShieldCheck size={18} />
                  </span>
                  Admin Panel
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Anti-fraud notice */}
        <div className="p-3 border-t border-gray-200 dark:border-[#2a2e45]">
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-0.5">Security Notice</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
              VPN and Proxy usage is strictly prohibited.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
