import { useState, useMemo } from 'react';
import { Layers, X, Loader2, CheckCircle2 } from 'lucide-react';
import { OFFERWALL_PROVIDERS } from '../../api/offerwallProviders';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from '../../contexts/RouterContext';

function OfferwallModal({
  provider,
  userId,
  onClose
}: {
  provider: typeof OFFERWALL_PROVIDERS[number];
  userId: string;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);

  const offerwallUrl = useMemo(() => {
    if (!provider.wallUrl || !userId) return null;
    return `${provider.wallUrl}?subid=${userId}`;
  }, [provider.wallUrl, userId]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161827] border-b border-[#2a2e45]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: provider.logoColor + '20', border: `1px solid ${provider.logoColor}40` }}
          >
            <span style={{ color: provider.logoColor }}>{provider.displayName[0]}</span>
          </div>
          <div>
            <h2 className="text-white font-semibold">{provider.displayName}</h2>
            <p className="text-xs text-gray-500">Complete offers to earn points</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-[#0d0f18]">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0f18] z-10">
            <Loader2 size={32} className="text-emerald-500 animate-spin mb-3" />
            <p className="text-gray-400 text-sm">Loading offerwall...</p>
          </div>
        )}

        {offerwallUrl && (
          <iframe
            src={offerwallUrl}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            title={`${provider.displayName} Offerwall`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-[#161827] border-t border-[#2a2e45]">
        <p className="text-xs text-gray-500 text-center">
          Points credited automatically after completion. May take up to 24 hours.
        </p>
      </div>
    </div>
  );
}

export default function OfferwallsPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [activeProvider, setActiveProvider] = useState<typeof OFFERWALL_PROVIDERS[0] | null>(null);

  const handleOpenWall = (provider: typeof OFFERWALL_PROVIDERS[number]) => {
    if (!user) return;
    if (provider.id === 'capsbit') {
      navigate('capsbit-page');
    } else if (provider.isActive && provider.wallUrl) {
      setActiveProvider(provider);
    }
  };

  const handleCloseWall = () => {
    setActiveProvider(null);
  };

  return (
    <div>
      {/* Modal */}
      {activeProvider && user && (
        <OfferwallModal
          provider={activeProvider}
          userId={user.id}
          onClose={handleCloseWall}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Offerwalls</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Complete offers to earn points. Choose a provider to get started.
        </p>
      </div>

      {/* Active Offerwalls */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-sm font-medium text-gray-300">Available Now</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {OFFERWALL_PROVIDERS
            .filter(p => p.isActive)
            .map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleOpenWall(provider)}
                className="card p-4 flex flex-col items-center text-center gap-3 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white transition-transform group-hover:scale-105"
                  style={{ backgroundColor: provider.logoColor + '20', border: `1px solid ${provider.logoColor}30` }}
                >
                  <span style={{ color: provider.logoColor }}>{provider.displayName[0]}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{provider.displayName}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Coming Soon */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-500">Coming Soon</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {OFFERWALL_PROVIDERS
            .filter(p => !p.isActive)
            .map((provider) => (
              <div
                key={provider.id}
                className="card p-4 flex flex-col items-center text-center gap-3 opacity-60"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
                  style={{ backgroundColor: provider.logoColor + '10', border: `1px solid ${provider.logoColor}20` }}
                >
                  <span style={{ color: provider.logoColor, opacity: 0.5 }}>{provider.displayName[0]}</span>
                </div>
                <div>
                  <p className="text-gray-400 font-medium text-sm">{provider.displayName}</p>
                  <span className="text-xs text-gray-600 mt-1">Coming Soon</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
