import { AlertCircle, Key, ExternalLink } from 'lucide-react';
import { SURVEY_PROVIDERS } from '../../api/surveyProviders';

function ProviderCard({ provider }: { provider: typeof SURVEY_PROVIDERS[number] }) {
  return (
    <div className="card p-6 hover:border-blue-500/30 transition-all group">
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
          style={{ backgroundColor: provider.logoColor + '25', border: `1px solid ${provider.logoColor}40` }}
        >
          <span style={{ color: provider.logoColor }}>
            {provider.displayName[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold">{provider.displayName}</h3>
            <span className="badge-disconnected">Not Connected</span>
          </div>
          <p className="text-gray-400 text-sm mt-1 leading-relaxed">{provider.description}</p>
        </div>
      </div>

      <div className="bg-[#1e2235] border border-[#2a2e45] rounded-lg p-3 mb-4">
        <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
          <Key size={12} />
          Required API Parameters
        </p>
        <div className="flex flex-wrap gap-1.5">
          {provider.requiredParams.map((param) => (
            <span
              key={param}
              className="bg-[#0d0f18] text-gray-300 text-xs font-mono px-2 py-0.5 rounded border border-[#2a2e45]"
            >
              {param}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={13} />
          API Required to activate
        </span>
        <div className="flex items-center gap-2">
          <a
            href={provider.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            Docs <ExternalLink size={11} />
          </a>
          <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors">
            Connect API
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SurveysPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Surveys</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Connect survey providers to start showing surveys to your users.
        </p>
      </div>

      <div className="card mb-6 p-4 flex items-start gap-3 border-yellow-500/20 bg-yellow-500/5">
        <AlertCircle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-300 font-medium text-sm">API Integration Required</p>
          <p className="text-gray-400 text-xs mt-0.5">
            No surveys will be displayed until API keys are configured for each provider.
            Contact each provider to obtain your API credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SURVEY_PROVIDERS.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  );
}
