-- Add idempotency_key column to payouts table
-- This prevents duplicate payout requests

ALTER TABLE payouts ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255);

-- Create unique index on idempotency_key
CREATE UNIQUE INDEX IF NOT EXISTS idx_payouts_idempotency_key ON payouts(idempotency_key);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payouts_user_status ON payouts(user_id, status);
