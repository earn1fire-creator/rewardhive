import { useEffect, useState } from 'react';
import {
  ShieldCheck, Loader2, AlertCircle, CheckCircle2,
  XCircle, CheckCheck, Clock, RefreshCw, ChevronDown, ChevronUp,
  Phone, Bitcoin, Wallet, CreditCard, Globe, DollarSign,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from '../../contexts/RouterContext';
import { supabase } from '../../lib/supabase';
import type { Withdrawal, WithdrawalStatus } from '../../types';

/* ─── helpers ──────────────────────────────────────────────────────── */
const METHOD_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  vodafone_cash: { label: 'Vodafone Cash', icon: <Phone size={13} />, color: 'text-red-400' },
  binance:       { label: 'Binance',       icon: <Bitcoin size={13} />, color: 'text-yellow-400' },
  paypal:        { label: 'PayPal',        icon: <Wallet size={13} />, color: 'text-blue-400' },
  giftcard:      { label: 'Gift Card',     icon: <CreditCard size={13} />, color: 'text-purple-400' },
  crypto:        { label: 'Crypto',        icon: <Globe size={13} />, color: 'text-emerald-400' },
};

const STATUS_CONFIG: Record<WithdrawalStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  pending:  { label: 'Pending',  cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: <Clock size={11} /> },
  approved: { label: 'Approved', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20',       icon: <CheckCircle2 size={11} /> },
  paid:     { label: 'Paid',     cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCheck size={11} /> },
  rejected: { label: 'Rejected', cls: 'text-red-400 bg-red-500/10 border-red-500/20',          icon: <XCircle size={11} /> },
};

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${c.cls}`}>
      {c.icon}{c.label}
    </span>
  );
}

const DETAIL_LABELS: Record<string, string> = {
  phone_number: 'Phone',
  binance_uid: 'Binance UID',
  wallet_address: 'Wallet',
  network: 'Network',
  paypal_email: 'PayPal Email',
  email: 'Delivery Email',
  card_type: 'Card Type',
};

/* ─── note modal ───────────────────────────────────────────────────── */
interface NoteModalProps {
  onConfirm: (note: string) => void;
  onCancel: () => void;
  loading: boolean;
  action: string;
}

function NoteModal({ onConfirm, onCancel, loading, action }: NoteModalProps) {
  const [note, setNote] = useState('');
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161827] border border-[#2a2e45] rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="p-5 border-b border-[#2a2e45]">
          <h3 className="font-semibold text-white">
            {action === 'rejected' ? 'Reject Withdrawal' : action === 'approved' ? 'Approve Withdrawal' : 'Mark as Paid'}
          </h3>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Admin Note <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field resize-none text-sm"
              rows={3}
              placeholder="e.g. Processed via dashboard, transaction ID: ..."
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} disabled={loading}
              className="flex-1 bg-[#1e2235] border border-[#2a2e45] text-gray-300 hover:text-white font-medium py-2 rounded-lg text-sm transition-all">
              Cancel
            </button>
            <button onClick={() => onConfirm(note)} disabled={loading}
              className={`flex-1 flex items-center justify-center gap-1.5 font-medium py-2 rounded-lg text-sm transition-all ${
                action === 'rejected'
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              {loading ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── row component ────────────────────────────────────────────────── */
function WithdrawalRow({
  w,
  onAction,
  actionLoading,
}: {
  w: Withdrawal;
  onAction: (id: string, status: WithdrawalStatus) => void;
  actionLoading: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const m = METHOD_LABELS[w.method];

  return (
    <>
      <tr className="border-b border-[#2a2e45] hover:bg-white/2 transition-colors">
        <td className="px-4 py-3">
          <p className="text-xs font-mono text-gray-500 mb-0.5">{w.id.slice(0, 8)}...</p>
          <p className="text-sm font-medium text-white">{w.username}</p>
          <p className="text-xs text-gray-500">{w.email}</p>
        </td>
        <td className="px-4 py-3">
          <span className={`flex items-center gap-1.5 text-sm font-medium ${m?.color ?? 'text-gray-400'}`}>
            {m?.icon}{m?.label ?? w.method}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className="text-sm font-bold text-white">${Number(w.amount).toFixed(2)}</span>
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={w.status} />
        </td>
        <td className="px-4 py-3 text-xs text-gray-500">
          {new Date(w.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            {w.status === 'pending' && (
              <>
                <button
                  onClick={() => onAction(w.id, 'approved')}
                  disabled={actionLoading === w.id}
                  className="text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-lg font-medium transition-all"
                >
                  Approve
                </button>
                <button
                  onClick={() => onAction(w.id, 'rejected')}
                  disabled={actionLoading === w.id}
                  className="text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg font-medium transition-all"
                >
                  Reject
                </button>
              </>
            )}
            {w.status === 'approved' && (
              <button
                onClick={() => onAction(w.id, 'paid')}
                disabled={actionLoading === w.id}
                className="text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-medium transition-all"
              >
                Mark Paid
              </button>
            )}
            {actionLoading === w.id && <Loader2 size={12} className="text-gray-400 animate-spin" />}
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-500 hover:text-gray-300 p-1 transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-[#2a2e45] bg-[#0d0f18]">
          <td colSpan={6} className="px-4 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(w.payment_details).map(([key, val]) =>
                val ? (
                  <div key={key}>
                    <p className="text-xs text-gray-500 mb-0.5">{DETAIL_LABELS[key] ?? key}</p>
                    <p className="text-sm text-white font-mono break-all">{val}</p>
                  </div>
                ) : null
              )}
              {w.admin_note && (
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-xs text-gray-500 mb-0.5">Admin Note</p>
                  <p className="text-sm text-gray-300">{w.admin_note}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ─── main page ────────────────────────────────────────────────────── */
export default function AdminPage() {
  const { profile } = useAuth();
  const { navigate } = useRouter();

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | WithdrawalStatus>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{ id: string; status: WithdrawalStatus } | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Guard: redirect non-admins immediately
  useEffect(() => {
    if (profile && !profile.is_admin) {
      navigate('dashboard');
    }
  }, [profile]);

  const load = async () => {
    setLoading(true);
    const query = supabase.from('withdrawals').select('*').order('created_at', { ascending: false });
    const { data } = await query;
    setWithdrawals((data as Withdrawal[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAction = (id: string, status: WithdrawalStatus) => {
    setPendingAction({ id, status });
  };

 const confirmAction = async (note: string) => {
    if (!pendingAction) return;
    setActionLoading(pendingAction.id);

    try {
      // هنا شيلنا الـ admin_note خالص عشان نمنع خطأ 400
      const { error } = await supabase
        .from('withdrawals')
        .update({ status: pendingAction.status })
        .eq('id', pendingAction.id);

      if (error) throw error;

      setFeedback({ type: 'success', msg: `Request marked as ${pendingAction.status}.` });
      
      // تحديث البيانات في الصفحة فوراً بدون admin_note
      setWithdrawals((prev) =>
        prev.map((w) =>
          w.id === pendingAction.id
            ? { ...w, status: pendingAction.status }
            : w
        )
      );
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', msg: 'Failed to update status. Try again.' });
    } finally {
      setActionLoading(null);
      setPendingAction(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };
  

  if (profile && !profile.is_admin) return null;

  const filtered = filter === 'all' ? withdrawals : withdrawals.filter((w) => w.status === filter);

  // Calculate statistics
  const stats = {
    total: withdrawals.length,
    totalAmount: withdrawals.reduce((sum, w) => sum + Number(w.amount), 0),
    pendingAmount: withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + Number(w.amount), 0),
    approvedAmount: withdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + Number(w.amount), 0),
    paidAmount: withdrawals.filter(w => w.status === 'paid').reduce((sum, w) => sum + Number(w.amount), 0),
    rejectedAmount: withdrawals.filter(w => w.status === 'rejected').reduce((sum, w) => sum + Number(w.amount), 0),
    counts: {
      all: withdrawals.length,
      pending: withdrawals.filter(w => w.status === 'pending').length,
      approved: withdrawals.filter(w => w.status === 'approved').length,
      paid: withdrawals.filter(w => w.status === 'paid').length,
      rejected: withdrawals.filter(w => w.status === 'rejected').length,
    },
  };

  return (
    <>
      {pendingAction && (
        <NoteModal
          action={pendingAction.status}
          onConfirm={confirmAction}
          onCancel={() => setPendingAction(null)}
          loading={actionLoading === pendingAction.id}
        />
      )}

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={20} className="text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Admin Withdrawals</h1>
            </div>
            <p className="text-gray-400 text-sm">Manage withdrawal requests and update payment statuses.</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 bg-[#1e2235] border border-[#2a2e45] text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg transition-all"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg mb-5 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {feedback.msg}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="card p-4">
            <p className="text-xs text-gray-500 font-medium mb-1">Total Requests</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 font-medium mb-1">Total Requested</p>
            <p className="text-2xl font-bold text-blue-400">${stats.totalAmount.toFixed(2)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 font-medium mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-emerald-400">${stats.paidAmount.toFixed(2)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 font-medium mb-1">Pending Amount</p>
            <p className="text-2xl font-bold text-yellow-400">${stats.pendingAmount.toFixed(2)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 font-medium mb-1">Approved Amount</p>
            <p className="text-2xl font-bold text-cyan-400">${stats.approvedAmount.toFixed(2)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500 font-medium mb-1">Rejected Amount</p>
            <p className="text-2xl font-bold text-red-400">${stats.rejectedAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {([
            { key: 'all',      label: 'All',      color: 'text-white bg-gray-600/30 border-gray-500/30' },
            { key: 'pending',  label: 'Pending',  color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
            { key: 'approved', label: 'Approved', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
            { key: 'paid',     label: 'Paid',     color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
            { key: 'rejected', label: 'Rejected', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
          ] as { key: 'all' | WithdrawalStatus; label: string; color: string }[]).map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-all ${
                filter === key ? color : 'bg-[#1e2235] border-[#2a2e45] text-gray-400 hover:text-white'
              }`}
            >
              {label}
              <span className="text-xs bg-black/30 px-1.5 py-0.5 rounded">
                {stats.counts[key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="text-gray-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <DollarSign size={24} className="text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium">No {filter !== 'all' ? filter : ''} withdrawal requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2e45] bg-[#0d0f18]">
                    {['User', 'Method', 'Amount', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w) => (
                    <WithdrawalRow
                      key={w.id}
                      w={w}
                      onAction={handleAction}
                      actionLoading={actionLoading}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
