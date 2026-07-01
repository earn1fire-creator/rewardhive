export interface OfferwallProviderConfig {
  id: string;
  name: string;
  displayName: string;
  logoColor: string;
  description: string;
  apiEndpoint: string;
  requiredParams: string[];
  callbackUrl: string;
  docsUrl: string;
  wallType: 'offerwall' | 'cpa' | 'gaming';
  isActive: boolean;
  wallUrl?: string;
}

export const OFFERWALL_PROVIDERS: OfferwallProviderConfig[] = [
  {
    id: 'cpalead',
    name: 'CPALead',
    displayName: 'CPALead',
    logoColor: '#10b981',
    description: 'Industry-leading CPA network with thousands of active offers globally. Complete surveys, downloads, and signups to earn points.',
    apiEndpoint: 'https://www.cpalead.com/api',
    requiredParams: ['API_KEY', 'USER_ID', 'GATEWAY_ID'],
    callbackUrl: '/api/callbacks/cpalead',
    docsUrl: 'https://cpalead.com/publishers',
    wallType: 'cpa',
    isActive: true,
    wallUrl: 'https://www.lnksforyou.com/wall/cVL5P6',
  },
  {
    id: 'playfull',
    name: 'Playfull',
    displayName: 'Playfull',
    logoColor: '#3b82f6',
    description: 'Gaming-focused offerwall with high-value game download offers.',
    apiEndpoint: 'https://api.playfull.com/v1',
    requiredParams: ['APP_KEY', 'SECRET', 'PUBLISHER_ID'],
    callbackUrl: '/api/callbacks/playfull',
    docsUrl: 'https://playfull.com/developers',
    wallType: 'gaming',
    isActive: false,
  },
  {
    id: 'vortexwall',
    name: 'VortexWall',
    displayName: 'VortexWall',
    logoColor: '#8b5cf6',
    description: 'Full-featured offerwall with diverse verticals and high eCPM.',
    apiEndpoint: 'https://api.vortexwall.com/v2',
    requiredParams: ['API_KEY', 'APP_ID', 'HASH_SECRET'],
    callbackUrl: '/api/callbacks/vortexwall',
    docsUrl: 'https://vortexwall.com/publishers',
    wallType: 'offerwall',
    isActive: false,
  },
  {
    id: 'notik',
    name: 'Notik',
    displayName: 'Notik',
    logoColor: '#06b6d4',
    description: 'Notification-based offerwall with push and in-app offer delivery.',
    apiEndpoint: 'https://api.notik.me/v1',
    requiredParams: ['API_TOKEN', 'SITE_ID', 'POSTBACK_KEY'],
    callbackUrl: '/api/callbacks/notik',
    docsUrl: 'https://notik.me/documentation',
    wallType: 'offerwall',
    isActive: false,
  },
  {
    id: 'ovnix',
    name: 'Ovnix',
    displayName: 'Ovnix',
    logoColor: '#f97316',
    description: 'Performance marketing offerwall with CPI, CPL, and CPA campaigns.',
    apiEndpoint: 'https://api.ovnix.com/v1',
    requiredParams: ['PUBLISHER_KEY', 'APP_HASH', 'CALLBACK_SECRET'],
    callbackUrl: '/api/callbacks/ovnix',
    docsUrl: 'https://ovnix.com/api-docs',
    wallType: 'cpa',
    isActive: false,
  },
  {
    id: 'tplayad',
    name: 'TPlayAd',
    displayName: 'TPlayAd',
    logoColor: '#ef4444',
    description: 'Mobile gaming offerwall specializing in reward-based ad campaigns.',
    apiEndpoint: 'https://api.tplayad.com/v1',
    requiredParams: ['APP_ID', 'SECRET_KEY', 'POSTBACK_TOKEN'],
    callbackUrl: '/api/callbacks/tplayad',
    docsUrl: 'https://tplayad.com/publisher-api',
    wallType: 'gaming',
    isActive: false,
  },
  {
    id: 'capsbit',
    name: 'Capsbit',
    displayName: 'Capsbit',
    logoColor: '#f59e0b',
    description: 'High-converting offerwall with global reach across surveys, app installs, and signups.',
    apiEndpoint: 'https://api.capsbit.com/469c8d5b186be1bc3fcf177ccc4c5c39',
    requiredParams: ['SECRET_KEY'],
    callbackUrl: '/api/callbacks/capsbit',
    docsUrl: 'https://api.capsbit.com',
    wallType: 'offerwall',
    isActive: true,
  },
];

export type OfferwallProviderId = 'playfull' | 'vortexwall' | 'notik' | 'ovnix' | 'cpalead' | 'tplayad' | 'capsbit';
