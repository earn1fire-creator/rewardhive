import { Layers } from 'lucide-react';
import { SURVEY_PROVIDERS } from '../../api/surveyProviders';

export default function SurveysPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Surveys</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Complete surveys to earn points. Choose a provider to get started.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-500">Coming Soon</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {SURVEY_PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className="card p-4 flex flex-col items-center text-center gap-3 opacity-60"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
                style={{ backgroundColor: provider.logoColor + '10', border: `1px solid ${provider.logoColor}20` }}
              >
                <span style={{ color: provider.logoColor, opacity: 0.5 }}>{provider.displayName[0]}</span>
              </div>
              <div>
                <p className="text-gray-400 font-medium text-sm">{provider.displayName}</p>
                <span className="text-xs text-gray-600 mt-1">Coming Soon</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
