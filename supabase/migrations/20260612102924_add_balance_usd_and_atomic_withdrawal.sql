/*
# Withdrawal System Balance + Atomic Deduction

## Changes

### 1. profiles table
- Added `balance_usd` (numeric(12,2), default 0.00) — USD wallet balance for withdrawals.
  This replaces the points-based system for withdrawal calculations.

### 2. New `request_withdrawal` function
Atomic stored procedure that:
- Validates the user has sufficient balance_usd
- Deducts the amount from balance_usd
- Creates the withdrawal record
- Returns the new withdrawal or an error

This prevents race conditions where users could submit multiple withdrawals
exceeding their balance.

### 3. Indexes
- Index on profiles.balance_usd for admin queries
*/

-- Add balance_usd to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'balance_usd'
  ) THEN
    ALTER TABLE profiles ADD COLUMN balance_usd numeric(12,2) NOT NULL DEFAULT 0.00;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_balance_usd ON profiles(balance_usd);

-- Atomic withdrawal request function
CREATE OR REPLACE FUNCTION request_withdrawal(
  p_user_id uuid,
  p_username text,
  p_email text,
  p_method text,
  p_amount numeric,
  p_payment_details jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance numeric(12,2);
  v_withdrawal_id uuid;
BEGIN
  -- Validate method
  IF p_method NOT IN ('vodafone_cash', 'binance', 'paypal', 'giftcard', 'crypto') THEN
    RETURN jsonb_build_object('error', 'Invalid withdrawal method');
  END IF;

  -- Validate minimum amount
  IF p_amount < 1 THEN
    RETURN jsonb_build_object('error', 'Minimum withdrawal amount is $1.00');
  END IF;

  -- Lock the user's profile row and get current balance
  SELECT balance_usd INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'User profile not found');
  END IF;

  -- Validate sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'error', 
      'Insufficient balance. Available: $' || v_current_balance::text
    );
  END IF;

  -- Deduct balance
  UPDATE profiles
  SET balance_usd = balance_usd - p_amount,
      updated_at = now()
  WHERE id = p_user_id;

  -- Create withdrawal record
  INSERT INTO withdrawals (
    user_id, username, email, method, amount, payment_details, status
  ) VALUES (
    p_user_id, p_username, p_email, p_method, p_amount, p_payment_details, 'pending'
  ) RETURNING id INTO v_withdrawal_id;

  -- Return success with withdrawal id
  RETURN jsonb_build_object(
    'success', true,
    'withdrawal_id', v_withdrawal_id,
    'new_balance', (SELECT balance_usd FROM profiles WHERE id = p_user_id)
  );
END;
$$;
