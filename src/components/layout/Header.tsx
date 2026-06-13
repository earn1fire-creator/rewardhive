import { useState } from 'react';
import { Menu, X, Zap, Bell, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from '../../contexts/RouterContext';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const { navigate } = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('home');
    setUserMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0d0f18]/95 backdrop-blur-sm border-b border-gray-200 dark:border-[#2a2e45]">
      <div className="flex items-center h-14 px-4 gap-4">
        {/* Mobile menu button */}
        {user && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        {/* Logo */}
        <button
          onClick={() => navigate(user ? 'dashboard' : 'home')}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-base hidden sm:block">RewardHive</span>
        </button>

        <div className="flex-1" />

        {user ? (
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Points balance */}
            <div className="hidden sm:flex items-center gap-1.5 bg-gray-100 dark:bg-[#1e2235] border border-gray-200 dark:border-[#2a2e45] rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {(profile?.points_balance ?? 0).toLocaleString()}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">pts</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              <Bell size={18} />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 bg-gray-100 dark:bg-[#1e2235] border border-gray-200 dark:border-[#2a2e45] rounded-lg px-3 py-1.5 hover:border-blue-500/50 transition-all"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {(profile?.username || user.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block text-sm text-gray-900 dark:text-white max-w-[100px] truncate">
                  {profile?.username || user.email}
                </span>
                <ChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e2235] border border-gray-200 dark:border-[#2a2e45] rounded-xl shadow-2xl py-1 z-50">
                  <button
                    onClick={() => { navigate('profile'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => { navigate('settings'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Settings
                  </button>
                  <div className="border-t border-gray-200 dark:border-[#2a2e45] my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => navigate('login')}
              className="btn-secondary text-sm px-4 py-2"
            >
              Login
            </button>
            <button
              onClick={() => navigate('register')}
              className="btn-primary text-sm px-4 py-2"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
