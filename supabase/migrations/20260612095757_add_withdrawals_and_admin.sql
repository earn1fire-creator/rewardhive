/*
# Withdrawal System Upgrade + Admin Support

## Changes

### 1. profiles table
- Added `is_admin` (boolean, default false) — marks admin users who can manage all withdrawals.
  Set to true via Supabase dashboard for admin accounts.

### 2. New `withdrawals` table
Replaces the old `withdrawal_requests` table for the new multi-method withdrawal system.

Columns:
- `id` — UUID primary key
- `user_id` — FK to auth.users (who submitted)
- `username` — denormalized username for quick admin display
- `email` — denormalized email for quick admin display
- `method` — text: vodafone_cash | binance | paypal | giftcard | crypto
- `amount` — numeric(10,2), USD dollar amount
- `payment_details` — JSONB with method-specific fields
- `status` — text: pending | approved | paid | rejected (default: pending)
- `admin_note` — optional admin comment
- `created_at` — timestamp

## Security

### RLS on withdrawals
- Users can SELECT their own rows (user_id = auth.uid())
- Admins (is_admin = true in profiles) can SELECT all rows
- Users can INSERT only rows where user_id matches their session
- Admins can UPDATE any row (to change status / add note)
- No DELETE policy — withdrawals are permanent records

### RLS on profiles (new policy)
- Admins can SELECT all profiles (needed for admin panel lookups)
*/

-- Add is_admin to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Allow admins to view all profiles (needed for admin panel)
DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
CREATE POLICY "admin_select_all_profiles" ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles p2 WHERE p2.id = auth.uid() AND p2.is_admin = true)
  );

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  method text NOT NULL CHECK (method IN ('vodafone_cash', 'binance', 'paypal', 'giftcard', 'crypto')),
  amount numeric(10,2) NOT NULL CHECK (amount >= 1),
  payment_details jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  admin_note text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Keep older databases compatible if withdrawals existed before updated_at was added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'withdrawals'
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE withdrawals
      ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Users see their own; admins see all
DROP POLICY IF EXISTS "select_withdrawals" ON withdrawals;
CREATE POLICY "select_withdrawals" ON withdrawals FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Users insert their own
DROP POLICY IF EXISTS "insert_own_withdrawals" ON withdrawals;
CREATE POLICY "insert_own_withdrawals" ON withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins update any (to change status/note)
DROP POLICY IF EXISTS "admin_update_withdrawals" ON withdrawals;
CREATE POLICY "admin_update_withdrawals" ON withdrawals FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- No delete policy — withdrawals are permanent audit records

-- Index for fast per-user queries and admin status filtering
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS update_withdrawals_updated_at ON withdrawals;
CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON withdrawals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
