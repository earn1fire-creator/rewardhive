/*
# Capsbit Offerwall Integration

## Changes
1. Extend postbacks table with offer metadata columns (if not exist)
2. Create process_capsbit_postback function for atomic reward crediting
3. Prevent duplicate rewards via transaction_id unique constraint
4. Track offer details (offer_id, offer_name, offer_type, country)
*/

-- ============================================
-- 1. EXTEND POSTBACKS TABLE
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'postbacks' AND column_name = 'offer_id'
  ) THEN
    ALTER TABLE postbacks ADD COLUMN offer_id text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'postbacks' AND column_name = 'offer_name'
  ) THEN
    ALTER TABLE postbacks ADD COLUMN offer_name text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'postbacks' AND column_name = 'offer_type'
  ) THEN
    ALTER TABLE postbacks ADD COLUMN offer_type text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'postbacks' AND column_name = 'country'
  ) THEN
    ALTER TABLE postbacks ADD COLUMN country text DEFAULT NULL;
  END IF;
END $$;

-- ============================================
-- 2. CAPSBIT POSTBACK FUNCTION
-- ============================================

DROP FUNCTION IF EXISTS process_capsbit_postback(text, uuid, integer, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION process_capsbit_postback(
  p_transaction_id text,
  p_user_id uuid,
  p_amount integer,
  p_ip_address text DEFAULT NULL,
  p_raw_payload text DEFAULT NULL,
  p_offer_id text DEFAULT NULL,
  p_offer_name text DEFAULT NULL,
  p_offer_type text DEFAULT NULL,
  p_country text DEFAULT NULL
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
    INSERT INTO postbacks (
      transaction_id, user_id, amount, status, ip_address, raw_payload,
      error_message, offer_id, offer_name, offer_type, country
    ) VALUES (
      p_transaction_id || '_dup_' || extract(epoch from now())::bigint,
      p_user_id, p_amount, 'duplicate', p_ip_address, p_raw_payload,
      'Original status: ' || v_existing_record.status,
      p_offer_id, p_offer_name, p_offer_type, p_country
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
    INSERT INTO postbacks (
      transaction_id, user_id, amount, status, ip_address, raw_payload,
      error_message, offer_id, offer_name, offer_type, country
    ) VALUES (
      p_transaction_id, p_user_id, p_amount, 'invalid_user', p_ip_address, p_raw_payload,
      'User profile not found',
      p_offer_id, p_offer_name, p_offer_type, p_country
    );

    RETURN jsonb_build_object(
      'success', false,
      'status', 'invalid_user',
      'message', 'User profile not found'
    );
  END IF;

  IF v_user_profile.is_banned THEN
    INSERT INTO postbacks (
      transaction_id, user_id, amount, status, ip_address, raw_payload,
      error_message, offer_id, offer_name, offer_type, country
    ) VALUES (
      p_transaction_id, p_user_id, p_amount, 'rejected', p_ip_address, p_raw_payload,
      'User account is banned',
      p_offer_id, p_offer_name, p_offer_type, p_country
    );

    RETURN jsonb_build_object(
      'success', false,
      'status', 'rejected',
      'message', 'User account is banned'
    );
  END IF;

  -- 3. CALCULATE POINTS
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
    'Completed offer via Capsbit offerwall: ' || COALESCE(p_offer_name, 'Unknown'),
    'completed',
    'capsbit',
    p_transaction_id
  );

  -- 6. RECORD SUCCESSFUL POSTBACK
  INSERT INTO postbacks (
    transaction_id, user_id, amount, points_awarded, status, ip_address, raw_payload,
    offer_id, offer_name, offer_type, country
  ) VALUES (
    p_transaction_id, p_user_id, p_amount, v_points_earned, 'processed', p_ip_address, p_raw_payload,
    p_offer_id, p_offer_name, p_offer_type, p_country
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
  INSERT INTO postbacks (
    transaction_id, user_id, amount, status, ip_address, raw_payload, error_message,
    offer_id, offer_name, offer_type, country
  ) VALUES (
    p_transaction_id, p_user_id, p_amount, 'error', p_ip_address, p_raw_payload, SQLERRM,
    p_offer_id, p_offer_name, p_offer_type, p_country
  );

  RETURN jsonb_build_object(
    'success', false,
    'status', 'error',
    'message', SQLERRM
  );
END;
$$;

-- ============================================
-- 3. GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION process_capsbit_postback TO service_role;