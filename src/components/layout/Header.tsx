import { useState } from 'react';
import { Menu, X, Zap, Bell, ChevronDown, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from '../../contexts/RouterContext';
import { HEADER_PROVIDERS } from '../../api/headerProviders';

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const { navigate } = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('home');
    setUserMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0f18]/95 backdrop-blur-sm border-b border-[#2a2e45]">
      <div className="flex items-center h-14 px-4 gap-4">
        {/* Mobile menu button */}
        {user && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
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
          <span className="font-bold text-white text-base hidden sm:block">RewardHive</span>
        </button>

        {/* Provider badges */}
        <div className="hidden md:flex items-center gap-2 ml-2">
          {HEADER_PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center gap-1.5 bg-[#1e2235] border border-[#2a2e45] rounded-full px-3 py-1 text-xs"
            >
              <span className="font-medium text-gray-300">{provider.displayName}</span>
              <span className="flex items-center gap-1 text-red-400">
                <AlertCircle size={10} />
                <span className="text-[10px]">Not Connected</span>
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        {user ? (
          <div className="flex items-center gap-2">
            {/* Points balance */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#1e2235] border border-[#2a2e45] rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-sm font-semibold text-white">
                {(profile?.points_balance ?? 0).toLocaleString()}
              </span>
              <span className="text-xs text-gray-400">pts</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell size={18} />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 bg-[#1e2235] border border-[#2a2e45] rounded-lg px-3 py-1.5 hover:border-blue-500/50 transition-all"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {(profile?.username || user.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block text-sm text-white max-w-[100px] truncate">
                  {profile?.username || user.email}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1e2235] border border-[#2a2e45] rounded-xl shadow-2xl py-1 z-50">
                  <button
                    onClick={() => { navigate('profile'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => { navigate('settings'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Settings
                  </button>
                  <div className="border-t border-[#2a2e45] my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
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
