import { useState } from 'react';
import { Lock, Bell, Shield, AlertTriangle, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 p-5 border-b border-[#2a2e45]">
        {icon}
        <h2 className="font-semibold text-white">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [passwordForm, setPasswordForm] = useState({
    current: '', newPass: '', confirm: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [notifications, setNotifications] = useState({
    emailWithdrawals: true,
    emailSurveys: false,
    emailReferrals: true,
    emailSecurity: true,
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!passwordForm.newPass) return setPasswordError('New password is required.');
    if (passwordForm.newPass.length < 8) return setPasswordError('Password must be at least 8 characters.');
    if (passwordForm.newPass !== passwordForm.confirm) return setPasswordError('Passwords do not match.');

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPass });
    setPasswordLoading(false);

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1 text-sm">Manage your account preferences and security.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Password */}
        <Section title="Change Password" icon={<Lock size={18} className="text-blue-400" />}>
          {passwordSuccess && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-lg mb-5">
              <CheckCircle2 size={16} /> Password updated successfully.
            </div>
          )}
          {passwordError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
              <AlertCircle size={16} /> {passwordError}
            </div>
          )}
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={passwordForm.newPass}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, newPass: e.target.value }))}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-primary flex items-center gap-2"
            >
              {passwordLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </Section>

        {/* Notifications */}
        <Section title="Notification Preferences" icon={<Bell size={18} className="text-purple-400" />}>
          <div className="space-y-4">
            {([
              { key: 'emailWithdrawals', label: 'Withdrawal Updates', desc: 'Email when withdrawal status changes' },
              { key: 'emailSurveys', label: 'New Surveys', desc: 'Email when new surveys become available' },
              { key: 'emailReferrals', label: 'Referral Activity', desc: 'Email when a referral completes an action' },
              { key: 'emailSecurity', label: 'Security Alerts', desc: 'Email for important account security events' },
            ] as { key: keyof typeof notifications; label: string; desc: string }[]).map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
                  className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${
                    notifications[key] ? 'bg-blue-600' : 'bg-[#2a2e45]'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    notifications[key] ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-4">Note: Notification delivery requires email service configuration by admin.</p>
        </Section>

        {/* Security */}
        <Section title="Security & Anti-Fraud" icon={<Shield size={18} className="text-emerald-400" />}>
          <div className="space-y-3">
            {[
              { label: 'VPN Detection', status: 'Active', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { label: 'Proxy Detection', status: 'Active', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { label: 'Suspicious Activity Monitoring', status: 'Active', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { label: 'CAPTCHA Protection', status: 'Ready', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
              { label: 'Account Protection', status: 'Active', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            ].map(({ label, status, color }) => (
              <div key={label} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-300">{label}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${color}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone" icon={<AlertTriangle size={18} className="text-red-400" />}>
          <p className="text-gray-400 text-sm mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            className="bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600/20 font-medium px-5 py-2 rounded-lg text-sm transition-all"
            onClick={() => alert('Account deletion requires admin confirmation. Please contact support.')}
          >
            Delete Account
          </button>
        </Section>
      </div>
    </div>
  );
}
