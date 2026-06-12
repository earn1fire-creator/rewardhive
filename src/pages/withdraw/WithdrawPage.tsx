import { useState, useEffect } from "react";
import {
  Phone,
  Bitcoin,
  Wallet,
  CreditCard,
  Globe,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  X,
  Clock,
  CheckCheck,
  XCircle,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type { Withdrawal, WithdrawalMethod } from "../../types";

/* ─── method config ──────────────────────────────────────────────── */
interface MethodConfig {
  id: WithdrawalMethod;
  label: string;
  icon: React.ReactNode;
  color: string;
  activeColor: string;
}

const METHODS: MethodConfig[] = [
  {
    id: "vodafone_cash",
    label: "Vodafone Cash",
    icon: <Phone size={18} />,
    color: "text-red-400",
    activeColor: "border-red-500/40 bg-red-500/10",
  },
  {
    id: "binance",
    label: "Binance",
    icon: <Bitcoin size={18} />,
    color: "text-yellow-400",
    activeColor: "border-yellow-500/40 bg-yellow-500/10",
  },
  {
    id: "paypal",
    label: "PayPal",
    icon: <Wallet size={18} />,
    color: "text-blue-400",
    activeColor: "border-blue-500/40 bg-blue-500/10",
  },
  {
    id: "giftcard",
    label: "Gift Card",
    icon: <CreditCard size={18} />,
    color: "text-purple-400",
    activeColor: "border-purple-500/40 bg-purple-500/10",
  },
  {
    id: "crypto",
    label: "Crypto",
    icon: <Globe size={18} />,
    color: "text-emerald-400",
    activeColor: "border-emerald-500/40 bg-emerald-500/10",
  },
];

const NETWORKS = [
  "TRC20 (Tron)",
  "ERC20 (Ethereum)",
  "BEP20 (BSC)",
  "SOL (Solana)",
  "MATIC (Polygon)",
  "ARB (Arbitrum)",
];
const GIFT_CARD_TYPES = [
  "Amazon",
  "Google Play",
  "Apple / iTunes",
  "Steam",
  "Netflix",
  "PlayStation",
  "Xbox",
  "Visa Prepaid",
];

/* ─── status badge ───────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; cls: string; icon: React.ReactNode }
  > = {
    pending: {
      label: "Pending",
      cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
      icon: <Clock size={11} />,
    },
    approved: {
      label: "Approved",
      cls: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      icon: <CheckCircle2 size={11} />,
    },
    paid: {
      label: "Paid",
      cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      icon: <CheckCheck size={11} />,
    },
    rejected: {
      label: "Rejected",
      cls: "text-red-400 bg-red-500/10 border-red-500/20",
      icon: <XCircle size={11} />,
    },
  };
  const c = map[status] ?? map.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${c.cls}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

/* ─── confirmation modal ─────────────────────────────────────────── */
interface ConfirmModalProps {
  method: MethodConfig;
  amount: string;
  balance: number;
  details: Record<string, string>;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function ConfirmModal({
  method,
  amount,
  balance,
  details,
  onConfirm,
  onCancel,
  loading,
}: ConfirmModalProps) {
  const detailLabels: Record<string, string> = {
    phone_number: "Phone Number",
    binance_uid: "Binance UID",
    wallet_address: "Wallet Address",
    network: "Network",
    paypal_email: "PayPal Email",
    email: "Delivery Email",
    card_type: "Gift Card Type",
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161827] border border-[#2a2e45] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#2a2e45]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-400" />
            <h2 className="font-semibold text-white">Confirm Withdrawal</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-[#1e2235] border border-[#2a2e45] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Method</span>
              <span
                className={`flex items-center gap-1.5 text-sm font-medium ${method.color}`}
              >
                {method.icon} {method.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Amount</span>
              <span className="text-lg font-bold text-white">
                ${parseFloat(amount).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">New Balance</span>
              <span className="text-sm text-gray-300">
                ${(balance - parseFloat(amount)).toFixed(2)}
              </span>
            </div>
            <div className="border-t border-[#2a2e45] pt-3 mt-3">
              <p className="text-xs text-gray-500 mb-2">Payment Details</p>
              {Object.entries(details).map(([key, val]) =>
                val ? (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-3 py-1"
                  >
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {detailLabels[key] ?? key}
                    </span>
                    <span className="text-xs text-white text-right break-all">
                      {val}
                    </span>
                  </div>
                ) : null,
              )}
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-xs text-yellow-300">
            The amount will be deducted from your balance immediately. Please
            verify all details.
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-[#1e2235] border border-[#2a2e45] text-gray-300 hover:text-white font-medium py-2.5 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <CheckCircle2 size={15} />
              )}
              {loading ? "Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── main page ──────────────────────────────────────────────────── */
export default function WithdrawPage() {
  const { user, profile, refreshProfile } = useAuth();

  const [selectedMethod, setSelectedMethod] =
    useState<WithdrawalMethod>("vodafone_cash");
  const [amount, setAmount] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    amount: number;
    newBalance: number;
  } | null>(null);

  const [history, setHistory] = useState<Withdrawal[]>([]);
  const [histLoading, setHistLoading] = useState(true);

  const balance = profile?.balance_usd ?? 0;
  const method = METHODS.find((m) => m.id === selectedMethod)!;

  const setField = (key: string, val: string) =>
    setFields((f) => ({ ...f, [key]: val }));

  const resetForm = () => {
    setAmount("");
    setFields({});
    setError("");
  };

  useEffect(() => {
    resetForm();
  }, [selectedMethod]);

  const loadHistory = async () => {
    setHistLoading(true);
    const { data } = await supabase
      .from("withdrawals")
      .select("*")
      .order("created_at", { ascending: false });
    setHistory((data as Withdrawal[]) ?? []);
    setHistLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, [success]);

  /* ── validation ── */
  const validate = (): string | null => {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt)) return "Please enter a withdrawal amount.";
    if (amt < 1) return "Minimum withdrawal amount is $1.00.";
    if (amt > balance)
      return `Insufficient balance. Available: $${balance.toFixed(2)}`;

    if (selectedMethod === "vodafone_cash") {
      if (!fields.phone_number?.trim()) return "Phone number is required.";
      if (!/^\+?[0-9]{8,15}$/.test(fields.phone_number.replace(/\s/g, "")))
        return "Please enter a valid phone number.";
    }
    if (selectedMethod === "binance") {
      if (!fields.binance_uid?.trim()) return "Binance UID is required.";
    }
    if (selectedMethod === "paypal") {
      if (!fields.paypal_email?.trim()) return "PayPal email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.paypal_email))
        return "Please enter a valid PayPal email address.";
    }
    if (selectedMethod === "giftcard") {
      if (!fields.email?.trim()) return "Delivery email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
        return "Please enter a valid email address.";
      if (!fields.card_type?.trim()) return "Please select a gift card type.";
    }
    if (selectedMethod === "crypto") {
      if (!fields.wallet_address?.trim()) return "Wallet address is required.";
      if (!fields.network?.trim()) return "Please select a network.";
    }
    return null;
  };

  const handleRequestClick = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");

    // Parse amount
    const amt = parseFloat(amount);

    // Build payment_details for this method
    let paymentDetails: Record<string, string> = {};
    switch (selectedMethod) {
      case "vodafone_cash":
        paymentDetails = { phone_number: fields.phone_number?.trim() ?? "" };
        break;
      case "binance":
        paymentDetails = { binance_uid: fields.binance_uid?.trim() ?? "" };
        break;
      case "paypal":
        paymentDetails = { paypal_email: fields.paypal_email?.trim() ?? "" };
        break;
      case "giftcard":
        paymentDetails = {
          email: fields.email?.trim() ?? "",
          card_type: fields.card_type?.trim() ?? "",
        };
        break;
      case "crypto":
        paymentDetails = {
          wallet_address: fields.wallet_address?.trim() ?? "",
          network: fields.network?.trim() ?? "",
        };
        break;
    }

    // Call the atomic withdrawal function
    const { data, error: rpcError } = await supabase.rpc("request_withdrawal", {
      p_user_id: user!.id,
      p_username: profile?.username ?? "",
      p_email: user?.email ?? "",
      p_method: selectedMethod,
      p_amount: amt,
      p_payment_details: paymentDetails,
    });

    if (rpcError) {
      setShowConfirm(false);
      setError(
        "Failed to submit request. " +
          (rpcError.message || "Please try again."),
      );
      setSubmitting(false);
      return;
    }

    const result = data as {
      error?: string;
      success?: boolean;
      withdrawal_id?: string;
      new_balance?: number;
    };

    if (result.error) {
      setShowConfirm(false);
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setShowConfirm(false);
    setSuccess(true);
    setSuccessInfo({ amount: amt, newBalance: result.new_balance ?? 0 });
    resetForm();
    await refreshProfile();
    setSubmitting(false);
    setTimeout(() => {
      setSuccess(false);
      setSuccessInfo(null);
    }, 6000);
  };

  // Check if form is valid for enabling submit button
  const isFormValid = (): boolean => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 1 || amt > balance) return false;

    switch (selectedMethod) {
      case "vodafone_cash":
        return /^\+?[0-9]{8,15}$/.test(
          (fields.phone_number ?? "").replace(/\s/g, ""),
        );
      case "binance":
        return (fields.binance_uid ?? "").trim().length > 0;
      case "paypal":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.paypal_email ?? "");
      case "giftcard":
        return (
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email ?? "") &&
          (fields.card_type ?? "").trim().length > 0
        );
      case "crypto":
        return (
          (fields.wallet_address ?? "").trim().length > 0 &&
          (fields.network ?? "").trim().length > 0
        );
      default:
        return false;
    }
  };

  /* ── method-specific form fields ── */
  const renderFields = () => {
    switch (selectedMethod) {
      case "vodafone_cash":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={fields.phone_number ?? ""}
              onChange={(e) => setField("phone_number", e.target.value)}
              className="input-field"
              placeholder="+20 1XX XXX XXXX"
            />
          </div>
        );
      case "binance":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Binance UID
            </label>
            <input
              type="text"
              value={fields.binance_uid ?? ""}
              onChange={(e) => setField("binance_uid", e.target.value)}
              className="input-field"
              placeholder="Enter your Binance UID"
            />
            <p className="text-xs text-gray-600 mt-1">
              Found in your Binance app under Profile.
            </p>
          </div>
        );
      case "paypal":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              PayPal Email
            </label>
            <input
              type="email"
              value={fields.paypal_email ?? ""}
              onChange={(e) => setField("paypal_email", e.target.value)}
              className="input-field"
              placeholder="your@paypal.com"
            />
          </div>
        );
      case "giftcard":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Delivery Email
              </label>
              <input
                type="email"
                value={fields.email ?? ""}
                onChange={(e) => setField("email", e.target.value)}
                className="input-field"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Gift Card Type
              </label>
              <select
                value={fields.card_type ?? ""}
                onChange={(e) => setField("card_type", e.target.value)}
                className="input-field"
              >
                <option value="">Select gift card...</option>
                {GIFT_CARD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
      case "crypto":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Wallet Address
              </label>
              <input
                type="text"
                value={fields.wallet_address ?? ""}
                onChange={(e) => setField("wallet_address", e.target.value)}
                className="input-field font-mono text-sm"
                placeholder="Your crypto wallet address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Network
              </label>
              <select
                value={fields.network ?? ""}
                onChange={(e) => setField("network", e.target.value)}
                className="input-field"
              >
                <option value="">Select network...</option>
                {NETWORKS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
    }
  };

  return (
    <>
      {showConfirm && (
        <ConfirmModal
          method={method}
          amount={amount}
          balance={balance}
          details={fields}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
          loading={submitting}
        />
      )}

      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Withdraw</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Request a withdrawal to your preferred payment method.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Form ── */}
          <div className="lg:col-span-3">
            {/* Balance card */}
            <div className="card p-5 mb-5 bg-gradient-to-br from-emerald-600/10 to-emerald-800/5 border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">
                      Available Balance
                    </p>
                    <p className="text-2xl font-bold text-white">
                      ${balance.toFixed(2)}
                    </p>
                  </div>
                </div>
                {balance < 1 && (
                  <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-full">
                    Minimum $1 required
                  </span>
                )}
              </div>
            </div>

            <div className="card p-6">
              {/* Method tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={`card flex flex-col items-center gap-1.5 py-3 px-2 transition-all text-center ${
                      selectedMethod === m.id
                        ? m.activeColor
                        : "hover:border-[#3a3e55]"
                    }`}
                  >
                    <span
                      className={
                        selectedMethod === m.id ? m.color : "text-gray-500"
                      }
                    >
                      {m.icon}
                    </span>
                    <span
                      className={`text-xs font-medium leading-tight ${selectedMethod === m.id ? "text-white" : "text-gray-500"}`}
                    >
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Alerts */}
              {success && successInfo && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-lg mb-5">
                  <CheckCircle2 size={16} />
                  Withdrawal of ${successInfo.amount.toFixed(2)} submitted. New
                  balance: ${successInfo.newBalance.toFixed(2)}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* Fields */}
              <div className="space-y-4">
                {renderFields()}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      $
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: "2.5rem" }}
                      placeholder="1.00"
                      min="1"
                      step="0.01"
                      max={balance}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-600">Min: $1.00</p>
                    <button
                      type="button"
                      onClick={() => setAmount(Math.max(1, balance).toFixed(2))}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Max: ${balance.toFixed(2)}
                    </button>
                  </div>
                </div>

                <div className="bg-[#1e2235] border border-[#2a2e45] rounded-lg p-3 text-xs text-gray-500 space-y-1">
                  <p className="text-gray-300 font-medium">Important Notes</p>
                  <p>
                    • Amount is deducted immediately upon request submission
                  </p>
                  <p>
                    • Processing times: 1-5 business days depending on method
                  </p>
                  <p>• VPN/Proxy usage will result in automatic rejection</p>
                </div>

                <button
                  onClick={handleRequestClick}
                  disabled={!isFormValid() || balance < 1}
                  className={`w-full py-3 flex items-center justify-center gap-2 mt-2 rounded-lg font-semibold transition-all ${
                    isFormValid() && balance >= 1
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Review & Submit
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ── History ── */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="p-4 border-b border-[#2a2e45]">
                <h2 className="font-semibold text-white">Withdrawal History</h2>
              </div>

              {histLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={18} className="text-gray-500 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Clock size={20} className="text-gray-500 mb-2" />
                  <p className="text-gray-400 text-sm">
                    No withdrawal requests yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#2a2e45] max-h-[520px] overflow-y-auto">
                  {history.map((w) => {
                    const m = METHODS.find((x) => x.id === w.method);
                    return (
                      <div key={w.id} className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={m?.color ?? "text-gray-400"}>
                              {m?.icon}
                            </span>
                            <span className="text-sm font-medium text-white">
                              {m?.label ?? w.method}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-white">
                            ${Number(w.amount).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>ID: {w.id.slice(0, 8)}...</span>
                          <span>
                            {new Date(w.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">
                            {w.method === "binance" &&
                              w.payment_details?.binance_uid}
                            {w.method === "paypal" &&
                              w.payment_details?.paypal_email}
                            {w.method === "vodafone_cash" &&
                              w.payment_details?.phone_number}
                            {w.method === "giftcard" &&
                              `${w.payment_details?.card_type}`}
                            {w.method === "crypto" &&
                              w.payment_details?.wallet_address?.slice(0, 12) +
                                "..."}
                          </span>
                          <StatusBadge status={w.status} />
                        </div>
                        {w.admin_note && (
                          <p className="text-xs text-gray-500 mt-1.5 bg-[#1e2235] rounded px-2 py-1">
                            Note: {w.admin_note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
