import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useRouter } from '../../contexts/RouterContext';

export default function SurveySecurityTerminatePage() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShieldAlert size={32} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-white mb-3">Security Alert</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Your session was flagged for security reasons. Please contact support if you think this is a mistake.
        </p>
        <button
          onClick={() => navigate('dashboard')}
          className="btn-primary flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
