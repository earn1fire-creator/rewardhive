import { useEffect, useMemo, useState } from 'react';
import { Gift, AlertCircle, ExternalLink, RefreshCw, Info, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// CPAlead Offerwall Configuration
const CPALEAD_WALL_URL = 'https://www.lnksforyou.com/wall/cVL5P6';

export default function OffersPage() {
  const { user, profile } = useAuth();
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Build the offerwall URL with user's ID as subid
  const offerwallUrl = useMemo(() => {
    if (!user?.id) return null;
    // Add subid for tracking, plus additional params for better tracking
    const params = new URLSearchParams({
      subid: user.id,
      // Optional: Add username for easier debugging
      ...(profile?.username && { username: profile.username }),
    });
    return `${CPALEAD_WALL_URL}?${params.toString()}`;
  }, [user?.id, profile?.username]);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Reload iframe
  const reloadIframe = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  // Refresh profile when user completes an offer (poll every 30 seconds when tab is visible)
  useEffect(() => {
    if (!user) return;

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Profile will be refreshed by the auth context
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Gift size={24} className="text-purple-400" />
              CPAlead Offers
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Complete offers to earn points. Points are credited automatically within minutes.
            </p>
          </div>
          <button
            onClick={reloadIframe}
            className="flex items-center gap-2 bg-[#1e2235] border border-[#2a2e45] text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg transition-all"
          >
            <RefreshCw size={14} />
            Refresh Offers
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="card mb-6 p-4 border-blue-500/20 bg-blue-500/5">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-300 font-medium mb-1">How it works</p>
            <ul className="text-gray-400 space-y-1">
              <li>• Browse available offers and click to start</li>
              <li>• Complete the offer requirements (downloads, signups, purchases, etc.)</li>
              <li>• Points are credited automatically after completion is verified</li>
              <li>• Some offers may take up to 24 hours to credit</li>
            </ul>
          </div>
        </div>
      </div>

      {/* User ID Warning */}
      {!user && (
        <div className="card mb-6 p-4 border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-300">
              Please log in to access the offerwall and earn points.
            </p>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      {user && (
        <div className="card mb-6 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-500">Current Points</p>
                <p className="text-lg font-bold text-yellow-400">
                  {(profile?.points_balance ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="h-8 w-px bg-[#2a2e45]" />
              <div>
                <p className="text-xs text-gray-500">Offers Completed</p>
                <p className="text-lg font-bold text-white">
                  {profile?.offers_completed ?? 0}
                </p>
              </div>
              <div className="h-8 w-px bg-[#2a2e45]" />
              <div>
                <p className="text-xs text-gray-500">Tracking ID</p>
                <p className="text-xs font-mono text-gray-400">{user.id.substring(0, 8)}...</p>
              </div>
            </div>
            <a
              href="https://cpalead.com/contact/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 transition-colors"
            >
              Offer not credited? <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}

      {/* Offerwall Iframe */}
      {user && offerwallUrl && (
        <div className="card overflow-hidden">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
              <p className="text-gray-400 text-sm">Loading offerwall...</p>
              <p className="text-gray-600 text-xs mt-1">This may take a few seconds</p>
            </div>
          )}

          {/* Iframe */}
          <iframe
            key={iframeKey}
            src={offerwallUrl}
            className="w-full border-0 transition-opacity duration-300"
            style={{
              height: '800px',
              minHeight: '600px',
              opacity: isLoading ? 0 : 1,
            }}
            onLoad={handleIframeLoad}
            title="CPAlead Offerwall"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {/* Fallback for non-logged users */}
      {!user && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-[#1e2235] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Gift size={32} className="text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Sign in to Access Offers</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Create an account or sign in to start earning points by completing offers from our partner network.
          </p>
        </div>
      )}

      {/* Footer Info */}
      {user && (
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            Powered by{' '}
            <a
              href="https://cpalead.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-400"
            >
              CPAlead
            </a>
            {' '}· Points are updated automatically upon offer completion
          </p>
        </div>
      )}
    </div>
  );
}
