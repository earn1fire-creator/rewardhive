export interface SurveyProviderConfig {
  id: string;
  name: string;
  displayName: string;
  logoColor: string;
  description: string;
  apiEndpoint: string;
  requiredParams: string[];
  callbackUrl: string;
  docsUrl: string;
}

export interface SurveyCallback {
  userId: string;
  surveyId: string;
  points: number;
  transactionId: string;
  signature: string;
}

export const SURVEY_PROVIDERS: SurveyProviderConfig[] = [
  {
    id: 'timewall',
    name: 'TimeWall',
    displayName: 'TimeWall',
    logoColor: '#3b82f6',
    description: 'High-paying survey panel with global reach and fast payouts.',
    apiEndpoint: 'https://api.timewall.io/v1',
    requiredParams: ['API_KEY', 'SECRET_KEY', 'CALLBACK_SECRET'],
    callbackUrl: '/api/callbacks/timewall',
    docsUrl: 'https://timewall.io/publishers',
  },
  {
    id: 'adgatemedia',
    name: 'AdGateMedia',
    displayName: 'AdGate Media',
    logoColor: '#10b981',
    description: 'Premium survey and offer network with competitive eCPMs.',
    apiEndpoint: 'https://adgatemedia.com/api/v1',
    requiredParams: ['APP_ID', 'SECRET_HASH', 'WALL_ID'],
    callbackUrl: '/api/callbacks/adgatemedia',
    docsUrl: 'https://adgatemedia.com/publishers',
  },
  {
    id: 'ayetstudios',
    name: 'AyetStudios',
    displayName: 'Ayet Studios',
    logoColor: '#f59e0b',
    description: 'Mobile-first survey and app testing platform with high conversion.',
    apiEndpoint: 'https://www.ayetstudios.com/api/v1',
    requiredParams: ['API_KEY', 'USER_ID_PARAM', 'SECURITY_TOKEN'],
    callbackUrl: '/api/callbacks/ayetstudios',
    docsUrl: 'https://www.ayetstudios.com/publishers',
  },
  {
    id: 'onlinesurvey',
    name: 'OnlineSurvey',
    displayName: 'OnlineSurvey',
    logoColor: '#8b5cf6',
    description: 'Academic and market research survey network with high-quality panels.',
    apiEndpoint: 'https://api.onlinesurvey.com/v2',
    requiredParams: ['API_KEY', 'PUBLISHER_ID', 'WEBHOOK_SECRET'],
    callbackUrl: '/api/callbacks/onlinesurvey',
    docsUrl: 'https://onlinesurvey.com/publisher-api',
  },
];

export type SurveyProviderId = 'timewall' | 'adgatemedia' | 'ayetstudios' | 'onlinesurvey';
