import { AlertCircle, Key, ExternalLink, Gamepad2, ShoppingBag, Target, Play, CheckCircle2, X, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { OFFERWALL_PROVIDERS } from '../../api/offerwallProviders';
import { useAuth } from '../../contexts/AuthContext';

const wallTypeIcon = (type: string) => {
  if (type === 'gaming') return <Gamepad2 size={12} />;
  if (type === 'cpa') return <Target size={12} />;
  return <ShoppingBag size={12} />;
};

const wallTypeColor = (type: string) => {
  if (type === 'gaming') return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
  if (type === 'cpa') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
};

interface ProviderCardProps {
  provider: typeof OFFERWALL_PROVIDERS[number];
  onOpenWall?: (provider: typeof OFFERWALL_PROVIDERS[number]) => void;
  activeWallId?: string | null;
}

function ProviderCard({ provider, onOpenWall, activeWallId }: ProviderCardProps) {
  const isActive = provider.isActive;
  const isOpen = activeWallId === provider.id;

  return (
    <div className={`card p-6 transition-all group ${isActive ? 'hover:border-emerald-500/40 cursor-pointer' : 'hover:border-purple-500/30'}`}>
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
          style={{ backgroundColor: provider.logoColor + '25', border: `1px solid ${provider.logoColor}40` }}
        >
          <span style={{ color: provider.logoColor }}>
            {provider.displayName[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold">{provider.displayName}</h3>
            {isActive ? (
              <span className="badge-connected">Active</span>
            ) : (
              <span className="badge-disconnected">Not Connected</span>
            )}
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${wallTypeColor(provider.wallType)}`}>
              {wallTypeIcon(provider.wallType)}
              {provider.wallType.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1 leading-relaxed">{provider.description}</p>
        </div>
      </div>

      {isActive ? (
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 size={13} />
            Ready to use
          </span>
          <button
            onClick={() => onOpenWall?.(provider)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            <Play size={14} />
            Open Offerwall
          </button>
        </div>
      ) : (
        <>
          <div className="bg-[#1e2235] border border-[#2a2e45] rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
              <Key size={12} />
              Required API Parameters
            </p>
            <div className="flex flex-wrap gap-1.5">
              {provider.requiredParams.map((param) => (
                <span
                  key={param}
                  className="bg-[#0d0f18] text-gray-300 text-xs font-mono px-2 py-0.5 rounded border border-[#2a2e45]"
                >
                  {param}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle size={13} />
              API Required to activate
            </span>
            <div className="flex items-center gap-2">
              <a
                href={provider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                Docs <ExternalLink size={11} />
              </a>
              <button className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors">
                Configure API
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#161827] border-b border-[#2a2e45]">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: provider.logoColor + '25', border: `1px solid ${provider.logoColor}40` }}
          >
            <span style={{ color: provider.logoColor }}>{provider.displayName[0]}</span>
          </div>
          <div>
            <h2 className="text-white font-semibold">{provider.displayName} Offerwall</h2>
            <p className="text-xs text-gray-400">Complete offers to earn points</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2e45] rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-[#0d0f18]">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0f18] z-10">
            <Loader2 size={32} className="text-emerald-500 animate-spin mb-4" />
            <p className="text-gray-400 text-sm">Loading offerwall...</p>
          </div>
        )},

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

      {/* Footer info */}
      <div className="p-3 bg-[#161827] border-t border-[#2a2e45]">
        <p className="text-xs text-gray-500 text-center">
          Points are credited automatically after offer completion. Some offers may take up to 24 hours to credit.
        </p>
      </div>
    </div>
  );
}

export default function OfferwallsPage() {
  const { user } = useAuth();
  const [activeWallId, setActiveWallId] = useState<string | null>(null);

  const activeProvider = OFFERWALL_PROVIDERS.find(p => p.id === activeWallId);

  const handleOpenWall = (provider: typeof OFFERWALL_PROVIDERS[number]) => {
    if (provider.isActive) {
      setActiveWallId(provider.id);
    }
  };

  const handleCloseWall = () => {
    setActiveWallId(null);
  };

  return (
    <div>
      {/* Offerwall Modal */}
      {activeProvider && user && (
        <OfferwallModal
          provider={activeProvider}
          userId={user.id}
          onClose={handleCloseWall}
        />
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Offerwalls</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Complete offers from our partners to earn points. Click on an active offerwall to get started.
        </p>
      </div>

      {/* Active offerwalls section */}
      {OFFERWALL_PROVIDERS.some(p => p.isActive) && (
        <div className="card mb-6 p-4 flex items-start gap-3 border-emerald-500/20 bg-emerald-500/5">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-emerald-300 font-medium text-sm">Active Offerwalls Available</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Click "Open Offerwall" on any active provider below to start earning points.
            </p>
          </div>
        </div>
      )}

      {/* Inactive offerwalls notice */}
      {OFFERWALL_PROVIDERS.some(p => !p.isActive) && (
        <div className="card mb-6 p-4 flex items-start gap-3 border-yellow-500/20 bg-yellow-500/5">
          <AlertCircle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-300 font-medium text-sm">More Offerwalls Coming Soon</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Additional offerwall providers require API integration. Contact admin for more providers.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {OFFERWALL_PROVIDERS.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onOpenWall={handleOpenWall}
            activeWallId={activeWallId}
          />
        ))}
      </div>
    </div>
  );
}
