/*
# CPAlead Postback Integration

## Tables

### postbacks
Tracks all incoming postbacks from CPAlead for:
- Duplicate prevention
- Fraud detection
- Audit trail

### fields:
- id: uuid primary key
- provider: 'cpalead'
- transaction_id: unique ID from CPAlead
- user_id: the subid passed to offerwall
- amount: points earned
- status: processed, duplicate, invalid_user, error
- ip_address: sender IP for security
- raw_payload: full query string for debugging
- created_at: timestamp

### Indexes
- Unique on transaction_id for duplicate prevention
- Index on user_id for quick lookups
- Index on status for admin queries
*/

-- Create postbacks table
CREATE TABLE IF NOT EXISTS postbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'cpalead',
  transaction_id text NOT NULL,
  user_id uuid DEFAULT NULL,
  amount integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'duplicate', 'invalid_user', 'error', 'rejected')),
  ip_address text DEFAULT NULL,
  raw_payload text DEFAULT NULL,
  error_message text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE postbacks ENABLE ROW LEVEL SECURITY;

-- Only admins can view postbacks (we'll allow service role full access)
DROP POLICY IF EXISTS "select_postbacks_admin" ON postbacks;
CREATE POLICY "select_postbacks_admin" ON postbacks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Service role can insert (for edge function)
DROP POLICY IF EXISTS "insert_postbacks_service" ON postbacks;
CREATE POLICY "insert_postbacks_service" ON postbacks FOR INSERT
  WITH CHECK (true);

-- Service role can update
DROP POLICY IF EXISTS "update_postbacks_service" ON postbacks;
CREATE POLICY "update_postbacks_service" ON postbacks FOR UPDATE
  USING (true) WITH CHECK (true);

-- Unique constraint on transaction_id to prevent duplicates at DB level
CREATE UNIQUE INDEX IF NOT EXISTS idx_postbacks_transaction_id_unique ON postbacks(transaction_id);

-- Index for quick user lookups
CREATE INDEX IF NOT EXISTS idx_postbacks_user_id ON postbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_postbacks_status ON postbacks(status);
CREATE INDEX IF NOT EXISTS idx_postbacks_created_at ON postbacks(created_at DESC);

-- Function to process CPAlead postback atomically
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
  v_existing_status text;
  v_user_exists boolean;
  v_current_points integer;
  v_current_balance numeric(12,2);
  v_points_earned integer;
BEGIN
  -- Check if transaction already exists (duplicate check)
  SELECT status INTO v_existing_status
  FROM postbacks
  WHERE transaction_id = p_transaction_id
  FOR UPDATE;
  
  IF FOUND THEN
    -- Record duplicate attempt
    INSERT INTO postbacks (transaction_id, user_id, amount, status, ip_address, raw_payload)
    VALUES (p_transaction_id, p_user_id, p_amount, 'duplicate', p_ip_address, p_raw_payload);
    
    RETURN jsonb_build_object(
      'success', false,
      'status', 'duplicate',
      'message', 'Transaction already processed'
    );
  END IF;
  
  -- Validate user exists
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE id = p_user_id AND is_banned = false
  ), points_balance, balance_usd INTO v_user_exists, v_current_points, v_current_balance
  FROM profiles WHERE id = p_user_id;
  
  IF NOT v_user_exists THEN
    -- Record invalid user attempt
    INSERT INTO postbacks (transaction_id, user_id, amount, status, ip_address, raw_payload)
    VALUES (p_transaction_id, p_user_id, p_amount, 'invalid_user', p_ip_address, p_raw_payload);
    
    RETURN jsonb_build_object(
      'success', false,
      'status', 'invalid_user',
      'message', 'User not found or banned'
    );
  END IF;
  
  -- Calculate points from amount (CPAlead sends USD value, multiply by 100)
  v_points_earned := p_amount;
  
  -- Update user's points and stats atomically
  UPDATE profiles
  SET 
    points_balance = points_balance + v_points_earned,
    total_earned = total_earned + v_points_earned,
    balance_usd = balance_usd + (v_points_earned::numeric / 100.0),
    offers_completed = offers_completed + 1,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Create transaction record
  INSERT INTO transactions (
    user_id, type, amount, description, status, provider_name, external_id
  ) VALUES (
    p_user_id, 'earn', v_points_earned, 
    'Completed offer via CPAlead offerwall',
    'completed', 'cpalead', p_transaction_id
  );
  
  -- Record successful postback
  INSERT INTO postbacks (transaction_id, user_id, amount, status, ip_address, raw_payload)
  VALUES (p_transaction_id, p_user_id, p_amount, 'processed', p_ip_address, p_raw_payload);
  
  RETURN jsonb_build_object(
    'success', true,
    'status', 'processed',
    'points_earned', v_points_earned,
    'new_balance', v_current_points + v_points_earned,
    'user_id', p_user_id::text
  );
  
EXCEPTION WHEN OTHERS THEN
  -- Log error
  INSERT INTO postbacks (transaction_id, user_id, amount, status, ip_address, raw_payload, error_message)
  VALUES (p_transaction_id, p_user_id, p_amount, 'error', p_ip_address, p_raw_payload, SQLERRM);
  
  RETURN jsonb_build_object(
    'success', false,
    'status', 'error',
    'message', SQLERRM
  );
END;
$$;