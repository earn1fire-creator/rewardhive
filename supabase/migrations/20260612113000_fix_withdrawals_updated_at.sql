/*
Repair the withdrawals timestamp column used by the updated_at trigger.

Some databases may have the withdrawals table without updated_at, which causes
update_updated_at_column() to fail with:
record "new" has no field "updated_at"
*/

ALTER TABLE withdrawals
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE withdrawals
  ALTER COLUMN updated_at SET DEFAULT now();

DROP TRIGGER IF EXISTS update_withdrawals_updated_at ON withdrawals;
CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON withdrawals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();