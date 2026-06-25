import { useState } from 'react';
import { Eye, EyeOff, Zap, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from '../../contexts/RouterContext';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const { signIn } = useAuth();
  const { navigate } = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const resolveEmail = async (value: string): Promise<string | null> => {
    if (isEmail(value)) return value.trim();
    // Username lookup — query profiles for matching username
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', value.trim())
      .maybeSingle();
    if (error || !data) return null;
    // Retrieve email via admin lookup isn't available client-side,
    // so we store a username→email mapping via a public lookup function
    // Instead, we rely on the user's auth email via a join through auth schema
    // which isn't accessible. Use a secure RPC instead.
    const { data: emailData, error: rpcError } = await supabase
      .rpc('get_email_by_username', { p_username: value.trim() });
    if (rpcError || !emailData) return null;
    return emailData as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    const email = await resolveEmail(identifier);
    if (!email) {
      setLoading(false);
      setError('No account found with that username or email.');
      return;
    }
    const { error: authError } = await signIn(email, password);
    setLoading(false);
    if (authError) {
      setError(authError.includes('Invalid') ? 'Invalid credentials. Please try again.' : authError);
    } else {
      navigate('dashboard');
    }
  };

  const looksLikeUsername = identifier && !isEmail(identifier);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-14">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 mt-1">Sign in to your RewardHive account</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="input-field pr-10"
                  placeholder="username or you@example.com"
                  autoComplete="username"
                />
                {looksLikeUsername && (
                  <User size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('register')}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Create one free
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          By signing in, you agree to our{' '}
          <button onClick={() => navigate('terms')} className="text-gray-400 hover:text-gray-300 underline">
            Terms of Service
          </button>{' '}
          and{' '}
          <button onClick={() => navigate('privacy')} className="text-gray-400 hover:text-gray-300 underline">
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
}
