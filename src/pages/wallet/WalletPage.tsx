import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from '../../contexts/RouterContext';
import { supabase } from '../../lib/supabase';
import type { Transaction } from '../../types';

const typeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  earn: { label: 'Earned', color: 'text-emerald-400', icon: <ArrowDownLeft size={14} /> },
  spend: { label: 'Spent', color: 'text-red-400', icon: <ArrowUpRight size={14} /> },
  withdraw: { label: 'Withdrawal', color: 'text-yellow-400', icon: <ArrowUpRight size={14} /> },
  bonus: { label: 'Bonus', color: 'text-purple-400', icon: <ArrowDownLeft size={14} /> },
  referral: { label: 'Referral', color: 'text-blue-400', icon: <ArrowDownLeft size={14} /> },
};

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    completed: { label: 'Completed', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle2 size={11} /> },
    pending: { label: 'Pending', cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: <Clock size={11} /> },
    failed: { label: 'Failed', cls: 'text-red-400 bg-red-500/10 border-red-500/20', icon: <XCircle size={11} /> },
    cancelled: { label: 'Cancelled', cls: 'text-gray-400 bg-gray-500/10 border-gray-500/20', icon: <XCircle size={11} /> },
  };
  const c = configs[status] ?? configs.pending;
  return (
    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${c.cls}`}>
      {c.icon}{c.label}
    </span>
  );
}

export default function WalletPage() {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      const { data } = await query;
      setTransactions((data as Transaction[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Wallet</h1>
        <p className="text-gray-400 mt-1 text-sm">Track your balance and transaction history.</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6 bg-gradient-to-br from-blue-600/15 to-purple-600/10 border-blue-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={18} className="text-blue-400" />
            <span className="text-sm font-medium text-gray-400">Current Balance</span>
          </div>
          <p className="text-3xl font-bold text-white">{(profile?.points_balance ?? 0).toLocaleString()}</p>
          <p className="text-sm text-blue-400 mt-1">points</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-emerald-400" />
            <span className="text-sm font-medium text-gray-400">Total Earned</span>
          </div>
          <p className="text-3xl font-bold text-white">{(profile?.total_earned ?? 0).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">lifetime points</p>
        </div>

        <div className="card p-6 flex flex-col justify-between">
          <p className="text-sm font-medium text-gray-400 mb-3">Ready to withdraw?</p>
          <button
            onClick={() => navigate('withdraw')}
            className="btn-primary text-sm py-2"
          >
            Withdraw Earnings
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-[#2a2e45] flex-wrap gap-3">
          <h2 className="font-semibold text-white">Transaction History</h2>
          <div className="flex gap-2 flex-wrap">
            {['all', 'earn', 'withdraw', 'referral', 'bonus'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1e2235] text-gray-400 hover:text-white border border-[#2a2e45]'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="text-gray-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 bg-[#1e2235] rounded-xl flex items-center justify-center mb-3">
              <Wallet size={20} className="text-gray-500" />
            </div>
            <p className="text-gray-400 font-medium">No transactions found</p>
            <p className="text-gray-600 text-sm mt-1">
              Complete surveys or offers to see your earnings here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#2a2e45]">
            {filtered.map((tx) => {
              const cfg = typeConfig[tx.type] ?? typeConfig.earn;
              return (
                <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/2 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg bg-[#1e2235] flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500">
                          {new Date(tx.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </p>
                        {tx.provider_name && (
                          <span className="text-xs text-gray-600">· {tx.provider_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={tx.status} />
                    <span className={`text-sm font-bold ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
