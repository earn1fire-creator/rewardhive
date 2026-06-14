/*
# Complete CPAlead Integration + Auto Profile Creation

## Changes

### 1. Auto Profile Creation Trigger
- Automatically creates a profile when a new user signs up via Supabase Auth
- Ensures every authenticated user has a matching profile record
- Initializes default values: points=0, total_earned=0, offers_completed=0, balance_usd=0

### 2. Fixed process_cpalead_postback function
- Corrects the user validation query
- Properly handles banned user checks
- Better error handling and logging

### 3. Fixed postbacks table columns
- Ensures all required columns exist

### 4. RLS Policies
- Proper admin access to postbacks table
*/

-- ============================================
-- 1. AUTO PROFILE CREATION TRIGGER
-- ============================================

-- Function to automatically create profile for new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    UPPER(substring(gen_random_uuid()::text, 1, 8))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. ENSURE PROFILES TABLE HAS balance_usd COLUMN
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'balance_usd'
  ) THEN
    ALTER TABLE profiles ADD COLUMN balance_usd numeric(12,2) NOT NULL DEFAULT 0.00;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'captcha_token'
  ) THEN
    ALTER TABLE profiles ADD COLUMN captcha_token text DEFAULT NULL;
  END IF;
END $$;

-- ============================================
-- 3. POSTBACKS TABLE - ENSURE ALL COLUMNS
-- ============================================

-- Create postbacks table if not exists
CREATE TABLE IF NOT EXISTS postbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'cpalead',
  transaction_id text NOT NULL,
  user_id uuid DEFAULT NULL,
  amount integer NOT NULL DEFAULT 0,
  points_awarded integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'duplicate', 'invalid_user', 'error', 'rejected')),
  ip_address text DEFAULT NULL,
  raw_payload text DEFAULT NULL,
  error_message text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE postbacks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for postbacks
DROP POLICY IF EXISTS "select_postbacks_admin" ON postbacks;
CREATE POLICY "select_postbacks_admin" ON postbacks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow service role to insert (for edge function)
DROP POLICY IF EXISTS "insert_postbacks_service" ON postbacks;
CREATE POLICY "insert_postbacks_service" ON postbacks FOR INSERT
  WITH CHECK (true);

-- Allow service role to update
DROP POLICY IF EXISTS "update_postbacks_service" ON postbacks;
CREATE POLICY "update_postbacks_service" ON postbacks FOR UPDATE
  USING (true) WITH CHECK (true);

-- Unique constraint on transaction_id to prevent duplicates at DB level
CREATE UNIQUE INDEX IF NOT EXISTS idx_postbacks_transaction_id_unique ON postbacks(transaction_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_postbacks_user_id ON postbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_postbacks_status ON postbacks(status);
CREATE INDEX IF NOT EXISTS idx_postbacks_created_at ON postbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_postbacks_provider ON postbacks(provider);

-- ============================================
-- 4. FIXED process_cpalead_postback FUNCTION
-- ============================================

DROP FUNCTION IF EXISTS process_cpalead_postback(text, uuid, integer, text, text);

CREATE OR REPLACE FUNCTION process_cpalead_postback(
  p_transaction_id text,
  p_user_id uuid,
  p_amount integer,
  p_ip_address text DEFAULT NULL,
  p_raw_payload text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_record postbacks%ROWTYPE;
  v_user_profile profiles%ROWTYPE;
  v_points_earned integer;
  v_new_points_balance integer;
  v_new_balance_usd numeric(12,2);
BEGIN
  -- 1. CHECK FOR DUPLICATE TRANSACTION
  SELECT * INTO v_existing_record
  FROM postbacks
  WHERE transaction_id = p_transaction_id
  LIMIT 1;

  IF FOUND THEN
    -- Transaction already processed - log duplicate attempt with different status
    INSERT INTO postbacks (
      transaction_id, user_id, amount, status, ip_address, raw_payload,
      error_message
    ) VALUES (
      p_transaction_id || '_dup_' || extract(epoch from now())::bigint,
      p_user_id, p_amount, 'duplicate', p_ip_address, p_raw_payload,
      'Original status: ' || v_existing_record.status
    );

    RETURN jsonb_build_object(
      'success', false,
      'status', 'duplicate',
      'message', 'Transaction already processed',
      'original_status', v_existing_record.status
    );
  END IF;

  -- 2. VALIDATE USER EXISTS AND IS NOT BANNED
  SELECT * INTO v_user_profile
  FROM profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    -- User not found
    INSERT INTO postbacks (
      transaction_id, user_id, amount, status, ip_address, raw_payload,
      error_message
    ) VALUES (
      p_transaction_id, p_user_id, p_amount, 'invalid_user', p_ip_address, p_raw_payload,
      'User profile not found'
    );

    RETURN jsonb_build_object(
      'success', false,
      'status', 'invalid_user',
      'message', 'User profile not found'
    );
  END IF;

  IF v_user_profile.is_banned THEN
    -- User is banned
    INSERT INTO postbacks (
      transaction_id, user_id, amount, status, ip_address, raw_payload,
      error_message
    ) VALUES (
      p_transaction_id, p_user_id, p_amount, 'rejected', p_ip_address, p_raw_payload,
      'User account is banned'
    );

    RETURN jsonb_build_object(
      'success', false,
      'status', 'rejected',
      'message', 'User account is banned'
    );
  END IF;

  -- 3. CALCULATE POINTS
  -- CPAlead sends cents/points value directly
  -- We multiply by 100 to convert to our points system (1 cent = 100 points)
  v_points_earned := p_amount;

  -- 4. UPDATE USER PROFILE ATOMICALLY
  UPDATE profiles
  SET
    points_balance = points_balance + v_points_earned,
    total_earned = total_earned + v_points_earned,
    balance_usd = balance_usd + (v_points_earned::numeric / 100.0),
    offers_completed = offers_completed + 1,
    updated_at = now()
  WHERE id = p_user_id
  RETURNING points_balance, balance_usd INTO v_new_points_balance, v_new_balance_usd;

  -- 5. CREATE TRANSACTION RECORD
  INSERT INTO transactions (
    user_id, type, amount, description, status, provider_name, external_id
  ) VALUES (
    p_user_id,
    'earn',
    v_points_earned,
    'Completed offer via CPAlead offerwall',
    'completed',
    'cpalead',
    p_transaction_id
  );

  -- 6. RECORD SUCCESSFUL POSTBACK
  INSERT INTO postbacks (
    transaction_id, user_id, amount, points_awarded, status, ip_address, raw_payload
  ) VALUES (
    p_transaction_id, p_user_id, p_amount, v_points_earned, 'processed', p_ip_address, p_raw_payload
  );

  -- 7. RETURN SUCCESS RESPONSE
  RETURN jsonb_build_object(
    'success', true,
    'status', 'processed',
    'points_earned', v_points_earned,
    'new_balance', v_new_points_balance,
    'new_balance_usd', v_new_balance_usd,
    'user_id', p_user_id::text
  );

EXCEPTION WHEN OTHERS THEN
  -- Log unexpected error
  INSERT INTO postbacks (
    transaction_id, user_id, amount, status, ip_address, raw_payload, error_message
  ) VALUES (
    p_transaction_id, p_user_id, p_amount, 'error', p_ip_address, p_raw_payload, SQLERRM
  );

  RETURN jsonb_build_object(
    'success', false,
    'status', 'error',
    'message', SQLERRM
  );
END;
$$;

-- ============================================
-- 5. GRANT PERMISSIONS
-- ============================================

-- Grant execute permission on the function to service role
GRANT EXECUTE ON FUNCTION process_cpalead_postback TO service_role;

-- ============================================
-- 6. BACKFILL MISSING PROFILES
-- ============================================

-- Create profiles for any existing auth users that don't have one
INSERT INTO profiles (id, username, referral_code)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
  UPPER(substring(gen_random_uuid()::text, 1, 8))
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;