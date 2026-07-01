import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from '../../contexts/RouterContext';

const CAPSBIT_PLACEMENT_API_KEY = '6f5cb23198aa31a32f2e9dee2abeb9';

export default function CapsbitPage() {
  const { user } = useAuth();
  const { navigate, goBack } = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const offerwallUrl = user
    ? `https://offerwall.capsbit.com/${CAPSBIT_PLACEMENT_API_KEY}/${user.id}`
    : null;

  useEffect(() => {
    if (!user) {
      navigate('login');
    }
  }, [user, navigate]);

  if (!user || !offerwallUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f18]">
        <Loader2 size={32} className="text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header Bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#161827] border-b border-[#2a2e45]">
        <button
          onClick={goBack}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: '#f59e0b20', border: '1px solid #f59e0b40' }}
          >
            <span style={{ color: '#f59e0b' }}>C</span>
          </div>
          <div>
            <h1 className="text-white font-semibold">Capsbit Offerwall</h1>
            <p className="text-xs text-gray-500">Complete offers to earn points</p>
          </div>
        </div>
      </div>

      {/* iframe Container */}
      <div className="flex-1 relative bg-[#0d0f18]">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0f18] z-10">
            <Loader2 size={32} className="text-emerald-500 animate-spin mb-3" />
            <p className="text-gray-400 text-sm">Loading Capsbit offerwall...</p>
          </div>
        )}

        <iframe
          src={offerwallUrl}
          className="w-full h-full border-0"
          style={{ minHeight: '800px' }}
          onLoad={() => setIsLoading(false)}
          title="Capsbit Offerwall"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
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
