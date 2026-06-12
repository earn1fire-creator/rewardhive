export interface HeaderProviderConfig {
  id: string;
  name: string;
  displayName: string;
  color: string;
  description: string;
  apiEndpoint: string;
  requiredParams: string[];
  connected: boolean;
}

export const HEADER_PROVIDERS: HeaderProviderConfig[] = [
  {
    id: 'revfox',
    name: 'Revfox',
    displayName: 'Revfox',
    color: '#3b82f6',
    description: 'Revenue optimization and survey routing platform.',
    apiEndpoint: 'https://api.revfox.com/v1',
    requiredParams: ['API_KEY', 'PUBLISHER_ID'],
    connected: false,
  },
  {
    id: 'voxylum',
    name: 'Voxylum',
    displayName: 'Voxylum',
    color: '#8b5cf6',
    description: 'Voice-of-customer survey aggregation platform.',
    apiEndpoint: 'https://api.voxylum.com/v1',
    requiredParams: ['ACCESS_TOKEN', 'SITE_ID'],
    connected: false,
  },
  {
    id: 'spectra',
    name: 'Spectra',
    displayName: 'Spectra',
    color: '#06b6d4',
    description: 'Multi-channel reward distribution and fulfillment network.',
    apiEndpoint: 'https://api.spectra.io/v2',
    requiredParams: ['API_KEY', 'MERCHANT_ID', 'WEBHOOK_SECRET'],
    connected: false,
  },
];
