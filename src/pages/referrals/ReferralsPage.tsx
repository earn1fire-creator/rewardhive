import { useEffect, useState } from 'react';
import { Users, Copy, CheckCheck, Loader2, Share2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Referral } from '../../types';

export default function ReferralsPage() {
  const { user, profile } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralLink = profile
    ? `${window.location.origin}?ref=${profile.referral_code}`
    : '';

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });
      setReferrals((data as Referral[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const copyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const counts = {
    total: referrals.length,
    qualified: referrals.filter((r) => r.status === 'qualified' || r.status === 'rewarded').length,
    rewarded: referrals.filter((r) => r.status === 'rewarded').length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Referrals</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Invite friends to RewardHive and earn together.
        </p>
      </div>

      {/* Referral link card */}
      <div className="card p-6 mb-6 bg-gradient-to-br from-blue-600/10 to-purple-600/5 border-blue-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Share2 size={18} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Your Referral Link</h2>
            <p className="text-gray-400 text-sm">Share this link to invite friends</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 bg-[#0d0f18] border border-[#2a2e45] rounded-lg px-4 py-2.5 text-sm text-gray-300 font-mono truncate">
            {referralLink || 'Loading...'}
          </div>
          <button
            onClick={copyLink}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Your referral code: <span className="font-mono text-blue-400 font-medium">{profile?.referral_code ?? '—'}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Referred', value: counts.total, color: 'text-white' },
          { label: 'Qualified', value: counts.qualified, color: 'text-blue-400' },
          { label: 'Rewarded', value: counts.rewarded, color: 'text-emerald-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-400 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* No bonus notice */}
      <div className="card p-4 mb-6 border-yellow-500/20 bg-yellow-500/5">
        <p className="text-yellow-300 text-sm font-medium mb-1">Referral Program</p>
        <p className="text-gray-400 text-xs">
          Referral rewards will be configured by the platform administrator. No automatic bonuses are granted at registration.
        </p>
      </div>

      {/* Referrals list */}
      <div className="card">
        <div className="p-5 border-b border-[#2a2e45]">
          <h2 className="font-semibold text-white">Referral History</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="text-gray-500 animate-spin" />
          </div>
        ) : referrals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-12 h-12 bg-[#1e2235] rounded-xl flex items-center justify-center mb-3">
              <Users size={20} className="text-gray-500" />
            </div>
            <p className="text-gray-400 font-medium">No referrals yet</p>
            <p className="text-gray-600 text-sm mt-1">
              Share your referral link to invite friends.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#2a2e45]">
            {referrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#1e2235] rounded-full flex items-center justify-center">
                    <Users size={14} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">Referred User</p>
                    <p className="text-xs text-gray-500">
                      {new Date(ref.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                  ref.status === 'rewarded'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : ref.status === 'qualified'
                    ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                    : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                }`}>
                  {ref.status.charAt(0).toUpperCase() + ref.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
