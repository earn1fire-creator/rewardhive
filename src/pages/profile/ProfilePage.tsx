import { useState } from 'react';
import { User, Mail, Globe, Calendar, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Spain', 'Italy', 'Brazil',
  'India', 'Japan', 'South Korea', 'Singapore', 'New Zealand', 'Other',
];

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username ?? '');
  const [country, setCountry] = useState(profile?.country ?? '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    if (!username.trim()) return setError('Username is required.');
    if (username.trim().length < 3) return setError('Username must be at least 3 characters.');
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return setError('Username can only contain letters, numbers, and underscores.');

    setLoading(true);
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ username: username.trim(), country })
      .eq('id', user!.id);

    if (updateErr) {
      if (updateErr.message.includes('duplicate') || updateErr.message.includes('unique')) {
        setError('Username is already taken.');
      } else {
        setError('Failed to update profile. Please try again.');
      }
      setLoading(false);
      return;
    }

    await refreshProfile();
    setSuccess(true);
    setEditing(false);
    setLoading(false);
  };

  const handleCancel = () => {
    setUsername(profile?.username ?? '');
    setCountry(profile?.country ?? '');
    setEditing(false);
    setError('');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 mt-1 text-sm">View and manage your account information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            {success && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-lg mb-5">
                <CheckCircle2 size={16} />
                Profile updated successfully.
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Avatar */}
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                {(profile?.username || 'U')[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{profile?.username}</h2>
                <p className="text-gray-400 text-sm">{user?.email}</p>
                {profile?.is_banned && (
                  <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5 mt-1">
                    <Shield size={10} /> Account Restricted
                  </span>
                )}
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                  <User size={14} /> Username
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field"
                    placeholder="your_username"
                  />
                ) : (
                  <p className="text-white font-medium">{profile?.username || '—'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                  <Mail size={14} /> Email Address
                </label>
                <p className="text-white font-medium">{user?.email}</p>
                <p className="text-xs text-gray-600 mt-0.5">Email cannot be changed from the profile page.</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                  <Globe size={14} /> Country
                </label>
                {editing ? (
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select country...</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-white font-medium">{profile?.country || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                  <Calendar size={14} /> Member Since
                </label>
                <p className="text-white font-medium">
                  {profile ? new Date(profile.created_at).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  }) : '—'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[#2a2e45]">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={handleCancel} className="btn-secondary">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => { setEditing(true); setSuccess(false); }} className="btn-primary">
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4">
          {[
            { label: 'Points Balance', value: (profile?.points_balance ?? 0).toLocaleString(), sub: 'current balance', color: 'text-yellow-400' },
            { label: 'Total Earned', value: (profile?.total_earned ?? 0).toLocaleString(), sub: 'lifetime', color: 'text-emerald-400' },
            { label: 'Surveys Done', value: profile?.surveys_completed ?? 0, sub: 'completed', color: 'text-blue-400' },
            { label: 'Offers Done', value: profile?.offers_completed ?? 0, sub: 'completed', color: 'text-purple-400' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="card p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-600">{sub}</p>
            </div>
          ))}

          <div className="card p-4">
            <p className="text-xs text-gray-500 font-medium mb-1">Referral Code</p>
            <p className="text-white font-mono font-bold text-lg">{profile?.referral_code ?? '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
