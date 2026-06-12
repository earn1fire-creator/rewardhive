/*
# RewardHive Platform Schema

## Overview
Creates the full database schema for the RewardHive survey rewards platform.

## New Tables

### profiles
Extends auth.users with platform-specific user data.
- id: references auth.users(id)
- username: unique display name
- country: user's country
- points_balance: current point balance (default 0)
- total_earned: lifetime earnings in points
- surveys_completed: count of completed surveys
- offers_completed: count of completed offers
- referral_code: unique referral code per user
- referred_by: who referred this user (referral_code)
- is_banned: admin ban flag
- created_at / updated_at

### transactions
Records all point movements for users.
- id, user_id, type (earn|spend|withdraw|bonus|referral)
- amount (can be negative for spend/withdraw)
- description
- status (pending|completed|failed|cancelled)
- provider_name: which survey/offer provider it came from
- external_id: provider's transaction ID for deduplication
- created_at

### withdrawal_requests
Tracks user withdrawal requests.
- id, user_id
- method (paypal|giftcard|crypto)
- amount_points: points being withdrawn
- destination: e.g. PayPal email, crypto address
- status (pending|processing|completed|rejected)
- admin_note
- created_at / updated_at

### referrals
Tracks referral relationships and status.
- id, referrer_id (user who referred), referred_id (new user)
- status (pending|qualified|rewarded)
- created_at

### support_tickets
Stores user support contact submissions.
- id, user_id (nullable for logged-out guests)
- name, email, subject, message
- status (open|in_progress|resolved|closed)
- created_at / updated_at

## Security
- RLS enabled on all tables
- Users can only read/write their own data
- Profiles auto-created on auth.users insert via trigger
*/

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  country text DEFAULT '',
  points_balance integer NOT NULL DEFAULT 0,
  total_earned integer NOT NULL DEFAULT 0,
  surveys_completed integer NOT NULL DEFAULT 0,
  offers_completed integer NOT NULL DEFAULT 0,
  referral_code text UNIQUE NOT NULL DEFAULT substring(gen_random_uuid()::text, 1, 8),
  referred_by text DEFAULT NULL,
  is_banned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Allow leaderboard: anyone authenticated can see username + points of others
DROP POLICY IF EXISTS "select_leaderboard" ON profiles;
CREATE POLICY "select_leaderboard" ON profiles FOR SELECT
  TO authenticated USING (true);

-- transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('earn', 'spend', 'withdraw', 'bonus', 'referral')),
  amount integer NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  provider_name text DEFAULT NULL,
  external_id text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions" ON transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
CREATE POLICY "insert_own_transactions" ON transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_transactions" ON transactions;
CREATE POLICY "update_own_transactions" ON transactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_transactions" ON transactions;
CREATE POLICY "delete_own_transactions" ON transactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- withdrawal_requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  method text NOT NULL CHECK (method IN ('paypal', 'giftcard', 'crypto')),
  amount_points integer NOT NULL CHECK (amount_points > 0),
  destination text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  admin_note text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_withdrawals" ON withdrawal_requests;
CREATE POLICY "select_own_withdrawals" ON withdrawal_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_withdrawals" ON withdrawal_requests;
CREATE POLICY "insert_own_withdrawals" ON withdrawal_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_withdrawals" ON withdrawal_requests;
CREATE POLICY "update_own_withdrawals" ON withdrawal_requests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_withdrawals" ON withdrawal_requests;
CREATE POLICY "delete_own_withdrawals" ON withdrawal_requests FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'rewarded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_referrals" ON referrals;
CREATE POLICY "select_own_referrals" ON referrals FOR SELECT
  TO authenticated USING (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "insert_own_referrals" ON referrals;
CREATE POLICY "insert_own_referrals" ON referrals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "update_own_referrals" ON referrals;
CREATE POLICY "update_own_referrals" ON referrals FOR UPDATE
  TO authenticated USING (auth.uid() = referrer_id) WITH CHECK (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "delete_own_referrals" ON referrals;
CREATE POLICY "delete_own_referrals" ON referrals FOR DELETE
  TO authenticated USING (auth.uid() = referrer_id);

-- support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tickets" ON support_tickets;
CREATE POLICY "select_own_tickets" ON support_tickets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_tickets_auth" ON support_tickets;
CREATE POLICY "insert_tickets_auth" ON support_tickets FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "insert_tickets_anon" ON support_tickets;
CREATE POLICY "insert_tickets_anon" ON support_tickets FOR INSERT
  TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "update_own_tickets" ON support_tickets;
CREATE POLICY "update_own_tickets" ON support_tickets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tickets" ON support_tickets;
CREATE POLICY "delete_own_tickets" ON support_tickets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_points_balance ON profiles(points_balance DESC);

-- Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_withdrawal_requests_updated_at ON withdrawal_requests;
CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
