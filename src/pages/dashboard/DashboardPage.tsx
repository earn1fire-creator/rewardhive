import { useEffect, useState } from 'react';
import {
  Wallet, TrendingUp, ClipboardList, Layers, ArrowUpRight,
  Clock, CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from '../../contexts/RouterContext';
import { supabase } from '../../lib/supabase';
import type { Transaction } from '../../types';

function StatCard({
  label, value, icon, color, sub,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) {
  return (
    <div className="card p-5 hover:border-blue-500/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <CheckCircle2 size={14} className="text-emerald-400" />;
  if (status === 'failed' || status === 'cancelled') return <XCircle size={14} className="text-red-400" />;
  return <Clock size={14} className="text-yellow-400" />;
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setTransactions((data as Transaction[]) ?? []);
      setTxLoading(false);
    })();
  }, []);

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, <span className="gradient-text">{profile?.username ?? 'User'}</span>
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Here's an overview of your earnings and activity.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Current Balance"
          value={`${(profile?.points_balance ?? 0).toLocaleString()} pts`}
          icon={<Wallet size={20} className="text-blue-400" />}
          color="bg-blue-500/15"
        />
        <StatCard
          label="Total Earned"
          value={`${(profile?.total_earned ?? 0).toLocaleString()} pts`}
          icon={<TrendingUp size={20} className="text-purple-400" />}
          color="bg-purple-500/15"
        />
        <StatCard
          label="Surveys Completed"
          value={profile?.surveys_completed ?? 0}
          icon={<ClipboardList size={20} className="text-cyan-400" />}
          color="bg-cyan-500/15"
        />
        <StatCard
          label="Offers Completed"
          value={profile?.offers_completed ?? 0}
          icon={<Layers size={20} className="text-emerald-400" />}
          color="bg-emerald-500/15"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'Start a Survey',
            desc: 'Browse available surveys and start earning',
            page: 'surveys' as const,
            color: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40',
            icon: <ClipboardList size={20} className="text-blue-400" />,
          },
          {
            label: 'View Offerwalls',
            desc: 'Complete offers to earn points faster',
            page: 'offerwalls' as const,
            color: 'from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40',
            icon: <Layers size={20} className="text-purple-400" />,
          },
          {
            label: 'Withdraw Earnings',
            desc: 'Convert your points to real money',
            page: 'withdraw' as const,
            color: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40',
            icon: <ArrowUpRight size={20} className="text-emerald-400" />,
          },
        ].map(({ label, desc, page, color, icon }) => (
          <button
            key={page}
            onClick={() => navigate(page)}
            className={`card p-5 text-left bg-gradient-to-br ${color} hover:scale-[1.01] transition-all group`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">{icon}</div>
              <div>
                <p className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors">
                  {label}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-[#2a2e45]">
          <h2 className="font-semibold text-white">Recent Transactions</h2>
          <button
            onClick={() => navigate('wallet')}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            View all
          </button>
        </div>

        {txLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="text-gray-500 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-12 h-12 bg-[#1e2235] rounded-xl flex items-center justify-center mb-3">
              <Wallet size={20} className="text-gray-500" />
            </div>
            <p className="text-gray-400 font-medium">No transactions yet</p>
            <p className="text-gray-600 text-sm mt-1">
              Complete your first survey or offer to see earnings here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#2a2e45]">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <StatusIcon status={tx.status} />
                  <div>
                    <p className="text-sm text-white font-medium">{tx.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString()}
                      {tx.provider_name && ` · ${tx.provider_name}`}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
