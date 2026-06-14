export type Page =
  | 'home'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'surveys'
  | 'offers'
  | 'offerwalls'
  | 'wallet'
  | 'rewards'
  | 'withdraw'
  | 'referrals'
  | 'leaderboard'
  | 'profile'
  | 'settings'
  | 'support'
  | 'privacy'
  | 'terms'
  | 'contact'
  | 'admin';

export interface Profile {
  id: string;
  username: string;
  country: string;
  points_balance: number;
  balance_usd: number;
  total_earned: number;
  surveys_completed: number;
  offers_completed: number;
  referral_code: string;
  referred_by: string | null;
  is_banned: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export type WithdrawalMethod = 'vodafone_cash' | 'binance' | 'paypal' | 'giftcard' | 'crypto';
export type WithdrawalStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export interface Withdrawal {
  id: string;
  user_id: string;
  username: string;
  email: string;
  method: WithdrawalMethod;
  amount: number;
  payment_details: Record<string, string>;
  status: WithdrawalStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'earn' | 'spend' | 'withdraw' | 'bonus' | 'referral';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  provider_name: string | null;
  external_id: string | null;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  method: 'paypal' | 'giftcard' | 'crypto';
  amount_points: number;
  destination: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: 'pending' | 'qualified' | 'rewarded';
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface ProviderStatus {
  name: string;
  connected: boolean;
  apiKeyConfigured: boolean;
}
